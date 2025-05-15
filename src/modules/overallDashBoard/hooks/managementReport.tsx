'use client'
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

// Define the shape of your context state
interface MyContextType {
    payloadData: any;
    setPayloadData: (payloadData: any) => void;
    showAlert: boolean;
    setShowAlert: (showAlert: boolean) => void;
    isAdding: boolean;
    setIsAdding: (showAlert: boolean) => void;
    selectedWC: any;
    topLossForWorkcenterData: any;
    setTopLossForWorkcenterData: (topLossForWorkcenterData: any) => void;
    topLossForResourceData: any;
    setTopLossForResourceData: (topLossForResourceData: any) => void;
    selectedTopLossDate: any;
    setSelectedTopLossDate: (selectedTopLossDate: any) => void;
    selectedTopLossPercentage: any;
    setSelectedTopLossPercentage: (selectedTopLossPercentage: any) => void;
    selectedWorkCenter: any;
    setSelectedWorkCenter: (selectedWorkCenter: any) => void;
    reasonCodeForResourceData: any;
    setReasonCodeForResourceData: (reasonCodeForResourceData: any) => void;
    eventSource: any;
    setEventSource: (eventSource: any) => void;

}

// Create the context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [payloadData, setPayloadData] = useState<any>();
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const selectedWC = useRef<any>();

    const [topLossForWorkcenterData, setTopLossForWorkcenterData] = useState<any>([]);
  const [topLossForResourceData, setTopLossForResourceData] = useState<any>([]);
  const [selectedTopLossDate, setSelectedTopLossDate] = useState<any>();
  const [selectedTopLossPercentage, setSelectedTopLossPercentage] = useState<any>();
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<any>();
  const [reasonCodeForResourceData, setReasonCodeForResourceData] = useState<any>([]);
  const [eventSource, setEventSource] = useState<any>("machine");

    return (
        <MyContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert, isAdding,
         setIsAdding, selectedWC, topLossForWorkcenterData, setTopLossForWorkcenterData, topLossForResourceData,
          setTopLossForResourceData, selectedTopLossDate, setSelectedTopLossDate, selectedTopLossPercentage, 
          setSelectedTopLossPercentage, selectedWorkCenter, setSelectedWorkCenter, reasonCodeForResourceData,
           setReasonCodeForResourceData, eventSource, setEventSource }}>
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
