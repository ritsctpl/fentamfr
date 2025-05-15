import { createContext } from "react";

interface CombinedContextType {
    payloadData:any;
    setPayloadData :(any) => void;
    showAlert: boolean;
    setShowAlert: (value: boolean) => void;
    username: string;
  }
export const ItemContext = createContext<CombinedContextType | undefined>(undefined);
