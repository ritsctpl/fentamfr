import { createContext } from "react";
import { InventoryRequest } from "../types/InventoryTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:InventoryRequest;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const InventoryContext = createContext<CombinedContextType | undefined>(undefined);

