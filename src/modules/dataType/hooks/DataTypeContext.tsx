import { createContext } from "react";
import { DataTypeRequest } from "../types/DataTypeTypes";


interface CombinedContextType {

  payloadData: any;
  setPayloadData: (value: any) => void;

  showAlert: boolean;
  setShowAlert: (value: boolean) => void;

  schemaData: any[];

  isList: boolean;
  setIsList: (value: boolean) => void;

  category: string;
  setCategory: (value: string) => void;
}
export const DataTypeContext = createContext<CombinedContextType | undefined>(undefined);
