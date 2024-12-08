"use client";
import { useState } from "react";

import { Moon, Sun, Laugh, Rabbit } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [currentModel, setCurrentModel] = useState("openai");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full w-12 h-12"
          size="icon"
        >
          <Image
            alt="logo"
            src="/img/logo.png"
            width="200"
            height="200"
          ></Image>{" "}
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setCurrentModel("openai");
          }}
          className={`px-2 py-1 rounded-md ${
            currentModel == "openai"
              ? "bg-gray-100 dark:bg-zinc-700 border-2 border-yellow-500"
              : ""
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <div className="flex flex-row items-center justify-center gap-2">
              <Laugh className="h-[1.2rem] w-[1.2rem]" />
              Q-berry
            </div>
            <small>Naughty but professional, for the normies.</small>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`px-2 py-1 rounded-md ${
            currentModel == "claude"
              ? "bg-gray-100 dark:bg-zinc-700 border-2 border-yellow-500"
              : ""
          }`}
          onClick={() => {
            setCurrentModel("claude");
          }}
        >
          <div className="flex flex-col items-center justify-center gap-2 w-full ">
            <div className="flex flex-row items-center justify-center gap-2">
              <Rabbit className="h-[1.2rem] w-[1.2rem]" />
              Rabbit
            </div>
            <small>Ultra model for highest pleasure</small>
          </div>
        </DropdownMenuItem>
        {theme == "light" ? (
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <span className="flex flex-row items-center gap-2 justify-center w-full">
              <Moon className="h-[1.2rem] w-[1.2rem]" />
              Dark
            </span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <span className="flex flex-row items-center gap-2 justify-center w-full">
              <Sun className="h-[1.2rem] w-[1.2rem]" />
              Light
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
