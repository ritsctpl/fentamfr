import { createContext } from "react";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    formChange: boolean;
    setFormChange: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    formData: any;
    setFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
    activeTab: number;
    setActiveTab: (value: number) => void;
  }
export const UserContext = createContext<CombinedContextType | undefined>(undefined);

