"use client";

import { Settings } from "@/components/theme-toggle-button";
import ModelCard from "@/components/models/model-card";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

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
  model_image_gallery: ModelImage[]; // Array of ModelImage
}

export type ModelsResponse = Model[];

const randomCardAspectRatio = () => {
  return [
    "portrait",
    "small-portrait",
    "large-portrait",
    "biggest-portrait",
    "smallest-portrait",
    "mid-size-portrait",
  ][Math.floor(Math.random() * 6)] as
    | "portrait"
    | "small-portrait"
    | "large-portrait"
    | "biggest-portrait"
    | "smallest-portrait"
    | "mid-size-portrait";
};

// Define the type for the response containing an array of models
export default function Home() {
  const [models, setModels] = useState<ModelsResponse>();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("http://localhost:8000/models");
        const shuffledModels = response.data.sort(() => Math.random() - 0.5);
        setModels(shuffledModels);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <div className="w-5/12 p-4">
          <div className="bg-slate-200 dark:bg-zinc-800 h-full w-full rounded-xl">
            <div className="flex justify-between px-3 py-2">
              <span className="text-lg font-semibold flex flex-row items-center justify-center">
                {" "}
                <Image
                  alt="logo"
                  src="/img/logo.png"
                  width="50"
                  height="50"
                ></Image>{" "}
              </span>
              <span className="flex flex-row items-center justify-center">
                <Settings />
              </span>
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
                    imageUrl={model?.model_thumbnail_image_src}
                    miniGallery={model?.model_image_gallery}
                    key={model.id}
                    aspectRatio={randomCardAspectRatio()}
                  />
                ))}
              {/* Duplicated cards */}
              {models
                ?.filter((_, i) => i % 3 === 0)
                .map((model: Model) => (
                  <ModelCard
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={randomCardAspectRatio()}
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
                    imageUrl={model?.model_thumbnail_image_src}
                    key={model.id}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={randomCardAspectRatio()}
                  />
                ))}
              {models
                ?.filter((_, i) => i % 3 === 1)
                .map((model: Model) => (
                  <ModelCard
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={randomCardAspectRatio()}
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
                    imageUrl={model?.model_thumbnail_image_src}
                    key={model.id}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={randomCardAspectRatio()}
                  />
                ))}
              {models
                ?.filter((_, i) => i % 3 === 2)
                .map((model: Model) => (
                  <ModelCard
                    imageUrl={model?.model_thumbnail_image_src}
                    key={`dup-${model.id}`}
                    miniGallery={model?.model_image_gallery}
                    aspectRatio={randomCardAspectRatio()}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden text-3xl h-screen flex items-center justify-center">
        We do not support mobile view yet.
      </div>
    </div>
  );
}
