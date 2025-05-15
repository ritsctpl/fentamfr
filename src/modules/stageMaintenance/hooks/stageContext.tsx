import { createContext } from "react";
import { StageData } from "@modules/stageMaintenance/types/stageTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData:StageData;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const StageContext = createContext<CombinedContextType | undefined>(undefined);

