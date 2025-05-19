import { createContext } from "react";

interface CombinedContextType {
  formData: object;
  setFormData :(value: Object) => void;
  }
export const TemplateBuilderContext = createContext<CombinedContextType | undefined>(undefined);