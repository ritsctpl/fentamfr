import { createContext } from "react";
import { ItemGroupData } from "../types/itemGroupTypes";


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
export const ItemGroupContext = createContext<CombinedContextType | undefined>(undefined);
