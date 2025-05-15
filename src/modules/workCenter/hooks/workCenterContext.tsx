import { createContext } from "react";
import { WorkCenterData } from "../types/workCenterTypes";


interface CombinedContextType {
   
   
    // formData:RoutingData;
    // setFormData :(value: Object) => void;

    
    // activeTab:number;
    // setActiveTab :(value: number) => void;
    
    payloadData:object;
    setPayloadData :(value: Object) => void;

    schemaData: object;
    mainSchema: object;

    // formSchema: object;
    // setFormSchema:(value: Object) => void;
    
    // schema: object;
    // setSchema:(value: Object) => void;

    addClickCount: number;

    showAlert: boolean;
    setShowAlert: (value: boolean) => void;


  }
export const WorkCenterContext = createContext<CombinedContextType | undefined>(undefined);
