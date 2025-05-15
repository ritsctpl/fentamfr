import { createContext } from "react";
import { User } from "../types/userTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:User;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const UserContext = createContext<CombinedContextType | undefined>(undefined);

