import { createContext } from "react";

  interface lineClearanceContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  }
export const lineClearanceContext = createContext<lineClearanceContextType | undefined>(undefined);