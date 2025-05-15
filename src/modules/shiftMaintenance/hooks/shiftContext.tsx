import { createContext } from "react";
import { Data } from "../types/shiftTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData:Data;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
    valueChange:boolean;
    setValueChange:(value:boolean)=>void;
  }
export const ShiftContext = createContext<CombinedContextType | undefined>(undefined);

