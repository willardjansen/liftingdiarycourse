"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="flex flex-col gap-2">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setTheme("light")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setTheme("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setTheme("system")}
          >
            <Monitor className="mr-2 h-4 w-4" />
            System
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
