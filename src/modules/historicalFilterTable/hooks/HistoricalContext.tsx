import { createContext } from "react";

interface CombinedContextType {
  formData: object;
  setFormData :(value: Object) => void;
  }
export const HistoricalContext = createContext<CombinedContextType | undefined>(undefined);