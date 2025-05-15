import { createContext } from "react";
import { PodConfig } from "../types/userTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:PodConfig;
    setFormData :(value: Object) => void;
    filterFormData:PodConfig;
    selectedRowData:any[];
    setData :(value: Object) => void;
    data:any;
    setFilterFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const PodContext = createContext<CombinedContextType | undefined>(undefined);

