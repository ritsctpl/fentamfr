import { createContext } from "react";
import { SiteRequest } from "../types/siteTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:SiteRequest;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
  }
export const SiteContext = createContext<CombinedContextType | undefined>(undefined);

