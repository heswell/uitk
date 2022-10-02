import { createContext } from "react";
import { ValidationStatus } from "@heswell/uitk-core";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
