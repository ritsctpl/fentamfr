import { createContext } from "react";
import { ShopOrder } from "../types/shopTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData:ShopOrder;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
    valueChange:any;
    setValueChange:any;
  }
export const UserContext = createContext<CombinedContextType | undefined>(undefined);

