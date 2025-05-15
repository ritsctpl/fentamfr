import { createContext } from "react";


interface CustomDataContextType {
  formData: object;
  formChange: boolean;
  // category: string;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  // setCategory :(value: string) => void;
  }
export const CustomDataContext = createContext<CustomDataContextType | undefined>(undefined);