import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  resetValue: boolean;
  setResetValue: (value: boolean) => void;
  }
export const NcCodeContext = createContext<CombinedContextType | undefined>(undefined);