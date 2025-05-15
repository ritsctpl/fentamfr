import { createContext } from "react";
import {  PayloadData } from "../types/nextNumberTypes";


interface CombinedContextType {
   
   
   
    
  // payloadData: PayloadData;
  // setPayloadData: React.Dispatch<React.SetStateAction<PayloadData>>;
  
  payloadData: any;
  setPayloadData: (any) => void;

    // schemaData: object;
    mainSchema: object;

    // formSchema: object;
    // setFormSchema:(value: Object) => void;
    
    // schema: object;
    // setSchema:(value: Object) => void;

    addClickCount: number;

    showAlert: boolean;
    setShowAlert: (value: boolean) => void;

    // handleClear: () => void;

    username: string;

    resetForm: boolean;
    setResetForm:  (value: boolean) => void;
    
    formData: any;
    setFormData:  (value: object) => void;

    

  }
export const NextNumberContext = createContext<CombinedContextType | undefined>(undefined);
