import { createContext } from "react";
import { DataFieldRequest } from "../types/DataFieldTypes";


interface CombinedContextType {

  payloadData: any;
  setPayloadData: (value: any) => void;

  showAlert: boolean;
  setShowAlert: (value: boolean) => void;

  schemaData: any[];

  isList: boolean;
  setIsList: (value: boolean) => void;

  showColumns: boolean;
  setShowColumns: (value: boolean) => void;
}
export const DataFieldContext = createContext<CombinedContextType | undefined>(undefined);
