import { createContext } from "react";
import { OperationData } from "../types/operationTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData:OperationData;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const OperationContext = createContext<CombinedContextType | undefined>(undefined);

