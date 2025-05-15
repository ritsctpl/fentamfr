import { createContext } from "react";
import { IntervalScheduler } from "../types/schedulerTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:IntervalScheduler;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const SchedulerContext = createContext<CombinedContextType | undefined>(undefined);

