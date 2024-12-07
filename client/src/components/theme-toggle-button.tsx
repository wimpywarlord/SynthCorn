"use client";

import * as React from "react";
import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {theme == "light" ? (
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <span className="flex flex-row items-center gap-2">
              <Moon className="h-[1.2rem] w-[1.2rem]" />
              Dark
            </span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <span className="flex flex-row items-center gap-2">
              <Sun className="h-[1.2rem] w-[1.2rem]" />
              Light
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
