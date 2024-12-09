"use client";

import { Settings } from "@/components/theme-toggle-button";
import ModelCard from "@/components/models/model-card";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "@/components/interface/chat";

// Define the type for an individual image in the model's image gallery
export interface ModelImage {
  id: number;
  image_url: string;
  created_at: string; // You can also use Date if you prefer to handle dates as Date objects
}

// Define the type for a model
export interface Model {
  id: number;
  name: string;
  model_thumbnail_image_src: string;
  model_prompt: string;
  likes: number;
  stans: number;
  impress_threshold: number;
  created_at: string; // You can also use Date if you prefer to handle dates as Date objects
  card_dimensions:
    | "portrait"
    | "small-portrait"
    | "large-portrait"
    | "biggest-portrait"
    | "smallest-portrait"
    | "mid-size-portrait";
  model_image_gallery: ModelImage[]; // Array of ModelImage
  kinks?: Array<{
    id: number;
    kink: string;
  }>;
  categories?: Array<{
    id: number;
    category: string;
  }>;
}

export type ModelsResponse = Model[];

// Define the type for the response containing an array of models
export default function Home() {
  const [models, setModels] = useState<ModelsResponse>();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${apiUrl}/models`);
        const shuffledModels = response.data.sort(() => Math.random() - 0.5);
        setModels(shuffledModels);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, [apiUrl]);

  const handleOnClickModelCard = (selectedModel: Model) => {
    setSelectedModel(selectedModel);
  };

  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    const fetchModelDetails = async () => {
      if (!selectedModel?.id) return;

      try {
        const response = await axios.get(
          `${apiUrl}/models/${selectedModel.id}`
        );

        // Only update if there are new details to add
        if (!selectedModel.kinks || !selectedModel.categories) {
          const modelWithDetails = {
            ...selectedModel,
            kinks: response.data.kinks,
            categories: response.data.categories,
          };
          setSelectedModel(modelWithDetails);
        }
      } catch (error) {
        console.error("Error fetching model details:", error);
      }
    };

    fetchModelDetails();
  }, [selectedModel?.id, apiUrl]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="hidden lg:flex h-screen">
        <div className="w-5/12 p-4 min-h-full">
          <div className="bg-slate-200 dark:bg-zinc-800 min-h-full w-full rounded-xl flex flex-col">
            {/* BODY */}
            <div className="transition-all duration-2000 w-full h-full flex-1 flex flex-col items-center justify-center">
              {!selectedModel && (
                <div
                  className={`w-full h-full flex flex-1 flex-col items-center justify-center animate-float ${
                    selectedModel
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                  }`}
                >
                  <>
                    <Image
                      alt="logo"
                      src="/img/logo.png"
                      width={250}
                      height={250}
                      priority
                    />
                    <span className="text-md font-thin text-zinc-500 dark:text-slate-200">
                      Who's it gonna be?
                    </span>
                  </>
                </div>
              )}
              {selectedModel && (
                <div
                  className={`transition-all duration-2000 flex flex-1 w-full h-full ${
                    selectedModel
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <ChatBox selectedModel={selectedModel} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-7/12 grid grid-flow-col auto-cols-fr gap-4">
          {/* Column 1 */}
          <div className="relative h-screen overflow-hidden">
            <div className="space-y-4 scroll-animation-1 absolute w-full">
              {/* Original cards */}
              {models
                ?.filter((_, i) => i % 3 === 0)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    miniGallery={model?.model_image_gallery}
                    key={model.id}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
              {/* Duplicated cards */}
              {models
                ?.filter((_, i) => i % 3 === 0)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
            </div>
          </div>

          {/* Column 2 */}
          <div className="relative h-screen overflow-hidden">
            <div className="space-y-4 scroll-animation-2 absolute w-full">
              {models
                ?.filter((_, i) => i % 3 === 1)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    key={model.id}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
              {models
                ?.filter((_, i) => i % 3 === 1)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
            </div>
          </div>

          {/* Column 3 */}
          <div className="relative h-screen overflow-hidden">
            <div className="space-y-4 scroll-animation-3 absolute w-full">
              {models
                ?.filter((_, i) => i % 3 === 2)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    key={model.id}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
              {models
                ?.filter((_, i) => i % 3 === 2)
                .map((model: Model) => (
                  <ModelCard
                    id={model.id}
                    modelData={model}
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    likes={model?.likes}
                    stans={model?.stans}
                    name={model?.name}
                    onClick={handleOnClickModelCard}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={model?.card_dimensions}
                  />
                ))}
            </div>
          </div>
        </div>
        {/* SETTINGS */}
        <div className="fixed bottom-5 right-5 z-50">
          {selectedModel && (
            <span className="flex flex-row items-center justify-center">
              <Settings />
            </span>
          )}
        </div>
      </div>
      <div className="lg:hidden text-3xl h-screen flex items-center justify-center">
        We do not support mobile view yet.
      </div>
    </div>
  );
}
