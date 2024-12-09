import { Heart, Eye } from "lucide-react";
import { Model } from "@/app/page";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomProgress } from "@/components/ui/custom-progress";

// Add types for messages
interface Message {
  type: "human" | "ai";
  content: string;
  timestamp: string;
  rewardImage?: string;
}

interface ChatResponse {
  message: string;
  conversationId: string;
  impressionScore: number;
  rewardImage?: string;
  avgScore: number;
}

const impressType = (selectedModel: Model) => {
  if (selectedModel.impress_threshold < 68) {
    return (
      <Badge
        className=" text-black
  dark:text-white bg-green-500 dark:bg-green-600 rounded-full"
      >
        Warm-Up
      </Badge>
    );
  } else if (
    selectedModel.impress_threshold > 68 &&
    selectedModel.impress_threshold < 74
  ) {
    return (
      <Badge
        className=" text-black
  dark:text-white bg-yellow-500 dark:bg-yellow-600 rounded-full"
      >
        Inner Circle
      </Badge>
    );
  } else if (
    selectedModel.impress_threshold > 74 &&
    selectedModel.impress_threshold < 80
  ) {
    return (
      <Badge
        className=" text-black
  dark:text-white bg-red-500 dark:bg-red-600 rounded-full"
      >
        Red Carpet
      </Badge>
    );
  } else if (
    selectedModel.impress_threshold > 80 &&
    selectedModel.impress_threshold < 85
  ) {
    return (
      <Badge
        className=" text-black
  dark:text-white bg-purple-500 dark:bg-purple-600 rounded-full"
      >
        Top Tier
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="
        border-2 
        border-[#FFD700] 
        dark:border-[#FFD700] 
        rounded-full 
        bg-gradient-to-r 
        from-[#FFD700] 
        via-[#FFF7CC] 
        to-[#FFD700] 
        bg-clip-text 
        text-transparent 
        text-black
        dark:text-white
        animate-shine
        font-bold
      "
        style={{
          animation: "shine 3s infinite",
          textShadow: "0 0 5px rgba(255, 215, 0, 0.5)",
        }}
      >
        Impossible Catch
      </Badge>
    );
  }
};

const ChatBox = ({ selectedModel }: { selectedModel: Model }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [impressionScore, setImpressionScore] = useState(0);

  // Reset chat when model changes
  useEffect(() => {
    // Reset all chat-related state
    setMessage("");
    setMessages([]);
    setConversationId(null);
    setIsLoading(false);
    setImpressionScore(0); // Add this line
  }, [selectedModel.id]); // Dependency on model ID ensures reset happens on model change

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        {
          type: "human",
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);

      const response = await axios.post<ChatResponse>(
        `http://localhost:8000/chat/${selectedModel.id}`,
        {
          message,
          conversationId,
        }
      );

      // Add AI response with reward image if present
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.data.message,
          timestamp: new Date().toISOString(),
          rewardImage: response.data.rewardImage,
        },
      ]);

      setConversationId(response.data.conversationId);
      setMessage("");

      // Update impression score when we get a response
      setImpressionScore(response.data.avgScore);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackgroundColor = () => {
    const threshold = selectedModel.impress_threshold;

    if (impressionScore >= threshold) {
      return "bg-pink-500 dark:bg-pink-500"; // pink for both modes
    }
    if (impressionScore >= threshold - 20) {
      return "bg-green-500 dark:bg-green-500"; // green for both modes
    }
    if (impressionScore >= threshold - 30) {
      return "bg-orange-500 dark:bg-orange-500"; // orange for both modes
    }
    return "bg-yellow-500 dark:bg-yellow-500"; // default color
  };

  return (
    <div className="w-full min-h-[100%] px-7">
      <div className="flex flex-col justify-between h-full py-5">
        <div>
          {/* Avatar */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-2 py-2">
              <div className="flex flex-row items-center gap-4">
                <Avatar className="border-2 border-white h-14 w-14">
                  <AvatarImage
                    className="object-cover"
                    src={selectedModel?.model_thumbnail_image_src}
                    alt="model_thumbnail"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedModel?.name}</span>
                    <span className="flex items-center justify-center">
                      {impressType(selectedModel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-medium w-12">
                      Impress Score
                    </span>
                    <CustomProgress
                      value={impressionScore}
                      max={selectedModel.impress_threshold}
                      className="h-2 w-full"
                      backgroundClass={getBackgroundColor()}
                    />
                    <span className="text-xs font-medium w-12">
                      {impressionScore <= selectedModel.impress_threshold
                        ? impressionScore
                        : selectedModel.impress_threshold}
                      /{selectedModel.impress_threshold}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Info Section */}
          {messages.length === 0 && (
            <div className="flex flex-col max-h-[75vh] gap-3 px-5 py-4 justify-center font-base bg-white dark:bg-zinc-950 rounded-xl">
              {/* Model Info Section */}
              <div className="text-3xl flex flex-row gap-4 text-slate-900 dark:text-slate-100">
                {selectedModel.name}
                <span className="flex items-center justify-center">
                  {impressType(selectedModel)}
                </span>
              </div>
              <div className="text-md text-slate-900 dark:text-slate-100">
                {selectedModel.model_prompt}
              </div>
              <div className="flex flex-row gap-2">
                <span>Kinks</span>
                {selectedModel.kinks?.map((kink) => (
                  <Badge
                    key={kink.id}
                    className={`!bg-pink-400 rounded-full text-black dark:text-white`}
                  >
                    {kink.kink}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-row gap-2">
                <span>Categories</span>
                {selectedModel.categories?.map((category) => (
                  <Badge
                    key={category.id}
                    className={`!bg-teal-400 rounded-full text-black dark:text-white`}
                  >
                    {category.category}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-row gap-4 justify-end">
                <div className="flex flex-row justify-center items-center  gap-2 text-slate-900 dark:text-slate-100">
                  <Heart className="h-4 w-4" />
                  <span>{selectedModel.likes}</span>
                </div>
                <div className="flex flex-row justify-center items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Eye className="h-4 w-4" />
                  <span>{selectedModel.stans}</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages Section */}
          {messages.length > 0 && (
            <div className="flex flex-col max-h-[65vh] flex-grow overflow-y-auto px-4 py-5 space-y-4 my-4 bg-transparent rounded-xl">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === "human" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                      msg.type === "human"
                        ? "bg-slate-700 dark:bg-slate-200 text-white dark:text-black rounded-br-none"
                        : "bg-gray-300 dark:bg-zinc-950 text-black dark:text-white rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.rewardImage && (
                      <div className="mt-3 animate-fade-in">
                        <img
                          src={msg.rewardImage}
                          alt="Reward"
                          className="rounded-lg max-h-[300px] w-auto object-cover animate-scale-in"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1 block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex flex-col max-h-[20vh] gap-3 py-5 px-4 rounded-xl bg-white dark:bg-zinc-950">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Impress ${
              selectedModel.name.split(" ")[0]
            } with your message...`}
            className="min-h-[100px] resize-none rounded-lg text-sm backdrop-blur transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
