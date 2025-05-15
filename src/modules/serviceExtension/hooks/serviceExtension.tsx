import { createContext } from "react";
import { ServiceExtensionType } from "../types/extensionTypes";

interface CombinedContextType {
    
    payloadData:object;
    setPayloadData :(value: Object) => void; 
    
    showAlert:boolean;
    setShowAlert :(value: boolean) => void;

    resetValue: boolean;

    addClickCount: number;
    activeTab: number;
    setActiveTab:(value: number) => void;


  }
export const ServiceExtensionContext = createContext<CombinedContextType | undefined>(undefined);
