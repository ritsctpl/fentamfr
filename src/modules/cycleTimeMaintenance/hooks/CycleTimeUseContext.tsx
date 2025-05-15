import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  isFormDisabled: boolean;
  setIsFormDisabled: (value: boolean) => void;
  }
export const CycleTimeUseContext = createContext<CombinedContextType | undefined>(undefined);