import { createContext } from "@heswell/uitk-core";

export interface ButtonBarContextValue {
  matches: boolean;
  alignedIndex?: number;
  align?: "left" | "right";
}

export const ButtonBarContext = createContext<ButtonBarContextValue>(
  "ButtonBarContext",
  {
    matches: false,
  }
);
