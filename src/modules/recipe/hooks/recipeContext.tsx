import { createContext } from "react";
import { Recipe } from "../types/recipeTypes";


interface CombinedContextType {
  isTableShowInActive: boolean;
  setIsTableShowInActive: (value: boolean) => void;
  isTableShow: boolean;
  setIsTableShow: (value: boolean) => void;
  isHeaderShow: boolean;
  setIsHeaderShow: (value: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData:Recipe;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const OperationContext = createContext<CombinedContextType | undefined>(undefined);

