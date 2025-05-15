import { createContext } from "react";

interface CombinedContextType {
  formData: object;
  formChange: boolean;
  activeTab: number;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  setActiveTab :(value: number) => void;
  }
export const ResourceContext = createContext<CombinedContextType | undefined>(undefined);