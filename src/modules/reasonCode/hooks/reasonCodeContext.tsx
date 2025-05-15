import { createContext } from "react";
import { ReasonCodeData } from "../types/reasonCodeTypes";


interface CombinedContextType {


  // formData:RoutingData;
  // setFormData :(value: Object) => void;


  // activeTab:number;
  // setActiveTab :(value: number) => void;

  payloadData: any;
  setPayloadData: (value: any) => void;

  showAlert: boolean;
  setShowAlert: (value: boolean) => void;

}
export const ReasonCodeContext = createContext<CombinedContextType | undefined>(undefined);
