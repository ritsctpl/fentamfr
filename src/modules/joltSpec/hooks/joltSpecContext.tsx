import { createContext } from "react";

interface CombinedContextType {

  payloadData: object;
  setPayloadData: (value: Object) => void;

  oReq: any;
  setOreq: (value: any) => void;

  showAlert: boolean;
  setShowAlert: (value: boolean) => void;

  isModalDummyVisible: boolean;
  setIsModalDummyVisible: (value: boolean) => void;

  disabledFields: any;
  setDisabledFields: (value: any) => void;

  mainSchema: object;
  addClickCount: number;
}
export const JoltSpecContext = createContext<CombinedContextType | undefined>(undefined);
