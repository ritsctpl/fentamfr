import { createContext } from "react";
import { NcGroupType } from "../types/ncGroupTypes";


interface CombinedContextType {
    
    payloadData:object;
    setPayloadData :(value: Object) => void; 
    
    showAlert:boolean;
    setShowAlert :(value: boolean) => void;

    schemaData: object;
    mainSchema: object;

    resetValue: boolean;

    addClickCount: number;
    activeTab: number;
    setActiveTab:(value: number) => void;


  }
export const NcGroupContext = createContext<CombinedContextType | undefined>(undefined);
