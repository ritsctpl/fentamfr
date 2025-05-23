import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { defaultFormData } from '../types/componentBuilderTypes';

// Define the shape of your context state
interface MyContextType {
    payloadData: any;
    setPayloadData: (payloadData: any) => void;
    showAlert: boolean;
    setShowAlert: (showAlert: boolean) => void;
    isAdding: boolean;
    setIsAdding: (showAlert: boolean) => void;
    isRequired: boolean;
    setIsRequired: (isRequired: boolean) => void;
    navigateToNewScreen: boolean;
    setNavigateToNewScreen: (isRequired: boolean) => void;
    fieldType: React.MutableRefObject<any>;
    seeFullScreen: any;
    setSeeFullScreen: (seeFullScreen: any) => void;
    transformedRowData: Array<{[key: string]: string}>;
    setTransformedRowData: (transformedRowData: Array<{[key: string]: string}>) => void;
    triggerSave: any;
    setTriggerSave: (triggerSave: any) => void;
    columnNames: any;
    setColumnNames: (columnNames: any) => void;
    rowData: { [key: string]: string };
    setRowData: (rowData: { [key: string]: string }) => void;
}

// Create the context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [payloadData, setPayloadData] = useState<any>(defaultFormData);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isRequired, setIsRequired] = useState<boolean>(false);
    const [navigateToNewScreen, setNavigateToNewScreen] = useState<boolean>(false);
    const fieldType = useRef<any>("Input");
    const [seeFullScreen, setSeeFullScreen] = useState<any>(false);
    const [transformedRowData, setTransformedRowData] = useState<Array<{[key: string]: string}>>([]);
    const [triggerSave, setTriggerSave] = useState<any>(0);
    const [columnNames, setColumnNames] = useState<any>([]);
    const [rowData, setRowData] = useState<any>();

    
        
    

    return (
        <MyContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding,
         isRequired, setIsRequired, navigateToNewScreen, setNavigateToNewScreen, fieldType, seeFullScreen, 
         setSeeFullScreen, transformedRowData, setTransformedRowData, triggerSave, setTriggerSave, columnNames,
          setColumnNames, rowData, setRowData }}>
            {children}
        </MyContext.Provider>
    );
};

// Create a custom hook to use the context
export const useMyContext = (): MyContextType => {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
