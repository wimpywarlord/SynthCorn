import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph, END } from "@langchain/langgraph";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Constants for message management
const MAX_MESSAGES = 20;
const SYSTEM_MESSAGE_TOKENS = 1000;
const MAX_TOKENS = 8000;

// Initialize ChatOpenAI
const llm = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
});

const claude = new ChatAnthropic({
  modelName: "claude-3-opus-20240229",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.7,
});

// Helper function to estimate tokens (rough estimation)
const estimateTokens = (text) => Math.ceil(text.length / 4);

// Function to window messages based on token limit
const getWindowedMessages = (messages, modelPrompt) => {
  let totalTokens = SYSTEM_MESSAGE_TOKENS + estimateTokens(modelPrompt);
  const windowedMessages = [];

  // Start from the most recent messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const messageTokens = estimateTokens(msg.content);

    // Check if adding this message would exceed token limit
    if (totalTokens + messageTokens > MAX_TOKENS) {
      break;
    }

    // Add message to the window
    windowedMessages.unshift(msg);
    totalTokens += messageTokens;
  }

  // Limit to maximum number of messages if needed
  if (windowedMessages.length > MAX_MESSAGES) {
    return windowedMessages.slice(-MAX_MESSAGES);
  }

  return windowedMessages;
};

// Define the state type with windowed messages
const createState = async (modelPrompt, history = []) => {
  try {
    // Convert history into messages
    const messages = history
      .map((msg) => {
        const content = msg.content || "";
        if (msg.type === "human") {
          return new HumanMessage(content);
        } else if (msg.type === "ai") {
          return new AIMessage(content);
        }
        return null;
      })
      .filter(Boolean);

    // Window the messages to prevent context overflow
    const windowedMessages = getWindowedMessages(messages, modelPrompt);

    return {
      messages: windowedMessages,
      modelPrompt,
      impressionScore: 0,
      fullHistory: history, // Keep full history in state
    };
  } catch (error) {
    console.error("Error initializing state:", error);
    throw error;
  }
};

// Create the graph
function createChatGraph(modelPrompt, impressThreshold, selectedLLM) {
  // Create a new state graph
  const workflow = new StateGraph({
    channels: {
      messages: "list",
      modelPrompt: "value",
      impressionScore: "value",
      fullHistory: "list",
    },
  });

  // Add the personality node
  workflow.addNode("personality", async (state) => {
    try {
      // Add context summary if messages were windowed
      const contextMessage =
        state.messages.length < state.fullHistory.length
          ? `[Previous context summary: This is message ${
              state.messages.length
            } of a ${
              state.fullHistory.length
            } message conversation. Recent topics: ${summarizeHistory(
              state.fullHistory
            )}]`
          : "";

      const messages = [
        new SystemMessage(`You are an OnlyFans model with the following personality:
      ${state.modelPrompt}

      ${contextMessage}

      Respond to the user's message in character. Be flirty, and slutty. Keep the conversation engaging.
      Keep responses under 50 words.

      Current conversation length: ${state.fullHistory.length} messages`),
        ...state.messages,
      ];

      const response = await selectedLLM.invoke(messages);

      return {
        ...state,
        messages: [...state.messages, response],
      };
    } catch (error) {
      console.error("Error in personality node:", error);
      throw error;
    }
  });

  // Add the scoring node
  workflow.addNode("scorer", async (state) => {
    try {
      if (state.messages.length < 2) {
        return { ...state, impressionScore: 0 };
      }

      const lastMessage = state.messages[state.messages.length - 2];
      if (!lastMessage) {
        throw new Error("No message to score");
      }

      const scoreResponse = await selectedLLM.invoke([
        new SystemMessage(`As an OnlyFans model with the following personality:
      ${state.modelPrompt}

      Rate the following message on a scale of 1-100 based on how impressed you would be:
      ${lastMessage.content}

      Consider factors like creativity, humor, charm, and respect.
      Return only the numeric score.`),
      ]);

      const score = parseInt(scoreResponse.content);
      if (isNaN(score) || score < 1 || score > 100) {
        throw new Error("Invalid score received");
      }

      // If score exceeds threshold, generate a gift message
      let giftMessage = "";
      if (score >= impressThreshold) {
        const giftResponse = await selectedLLM.invoke([
          new SystemMessage(`You are an OnlyFans model with the following personality:
        ${state.modelPrompt}

        The user just impressed you with their message. Write a flirty, brief response (max 2 sentences) 
        telling them you're sending them a special photo as a reward.
        Be playful but tasteful.`),
        ]);
        giftMessage = giftResponse.content;
      }

      return {
        ...state,
        impressionScore: score,
        giftMessage: giftMessage,
      };
    } catch (error) {
      console.error("Error in scorer node:", error);
      throw error;
    }
  });

  // Set edges including start
  workflow.addEdge("__start__", "personality");
  workflow.addEdge("personality", "scorer");
  workflow.addEdge("scorer", END);

  // Compile the graph
  return workflow.compile();
}

// Helper function to summarize history
const summarizeHistory = (history) => {
  // Get last few messages before the window
  const recentHistory = history.slice(-5);
  return (
    recentHistory
      .map((msg) => msg.content)
      .join(" | ")
      .slice(0, 100) + "..."
  );
};

router.post("/:model_id", async (req, res) => {
  const { model_id } = req.params;
  const { message, llmType = "openai" } = req.body;
  let { conversationId = null } = req.body;
  const { supabaseClient } = req;

  try {
    // 1. First, fetch the model details
    const { data: model, error: modelError } = await supabaseClient
      .from("models")
      .select(
        `
        id,
        name,
        model_prompt,
        impress_threshold,
        model_image_gallery (
          id,
          image_url,
          created_at
        ),
        kinks (
          id,
          kink
        ),
        categories (
          id,
          category
        )
      `
      )
      .eq("id", model_id)
      .single();

    if (modelError) throw modelError;
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    // Format kinks and categories for the prompt
    const kinksText = model.kinks?.map((k) => k.kink).join(", ") || "";
    const categoriesText =
      model.categories?.map((c) => c.category).join(", ") || "";

    // Add kinks and categories to the model prompt
    const enhancedPrompt = `${model.model_prompt} Kinks: ${kinksText} Categories: ${categoriesText}`;

    // Update model object with enhanced prompt
    model.model_prompt = enhancedPrompt;

    // 2. Fetch or create conversation from database
    let conversation;
    if (conversationId) {
      // Get existing conversation
      const { data, error } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      conversation = data;
    } else {
      // Create new conversation
      const { data, error } = await supabaseClient
        .from("conversations")
        .insert({
          model_id,
          created_at: new Date(),
          updated_at: new Date(),
          messages: [], // Empty message history
        })
        .select()
        .single();

      if (error) throw error;
      conversation = data;
      conversationId = conversation.id;
    }

    // 3. Create state from conversation history
    const state = await createState(model.model_prompt, conversation.messages);

    // 4. Select LLM based on type and create graph
    const selectedLLM = llmType === "anthropic" ? claude : llm;
    const graph = createChatGraph(
      model.model_prompt,
      model.impress_threshold,
      selectedLLM
    );

    // 5. Add new message to both windowed messages and full history
    const newMessage = new HumanMessage(message);
    state.messages.push(newMessage);
    state.fullHistory.push({
      type: "human",
      content: message,
      timestamp: new Date(),
    });

    // 6. Process message through the graph
    const newState = await graph.invoke(state);

    // 7. Get the model's response (last message)
    const response = newState.messages[newState.messages.length - 1];

    // 8. Update conversation in database with full history
    await supabaseClient
      .from("conversations")
      .update({
        messages: [
          ...state.fullHistory,
          {
            type: "ai",
            content: response.content,
            timestamp: new Date(),
          },
        ],
        updated_at: new Date(),
      })
      .eq("id", conversationId);

    // Update the route handler response section:
    let responseMessage = response.content;
    let rewardImage = null;

    if (
      newState.impressionScore >= model.impress_threshold &&
      model.model_image_gallery.length > 0
    ) {
      const randomIndex = Math.floor(
        Math.random() * model.model_image_gallery.length
      );
      rewardImage = model.model_image_gallery[randomIndex].image_url;
      responseMessage += "\n\n" + newState.giftMessage;
    }

    res.json({
      conversationId,
      message: responseMessage,
      impressionScore: newState.impressionScore,
      rewardImage,
      llmType, // Include the LLM type in the response
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
