import { createContext } from "react";
import { UomData } from "../types/UomTypes";


interface CombinedContextType {

  payloadData: object;
  setPayloadData: (value: Object) => void;

  uomPayloadData: object;
  setUomPayloadData: (value: Object) => void;

  mainSchema: object;

  username: string;

  addClickCount: number;

  showAlert: boolean;
  setShowAlert: (value: boolean) => void;

  uomConversionPayload: any;
  setUomConversionPayload: (value: any) => void;

  activeTab: number;
  setActiveTab: (value: number) => void;

  showAlertForConversion: boolean;
  setShowAlertForConversion: (value: boolean) => void;

}
export const UomContext = createContext<CombinedContextType | undefined>(undefined);
