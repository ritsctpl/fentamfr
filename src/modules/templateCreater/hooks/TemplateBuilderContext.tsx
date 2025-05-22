import { createContext } from "react";

interface CombinedContextType {
  call: number;
  setCall: (value: number) => void;
  setShowEditor: (value: boolean) => void;
  setIsFromTableClick: (value: boolean) => void;
}

export const TemplateBuilderContext = createContext<CombinedContextType | undefined>(undefined);