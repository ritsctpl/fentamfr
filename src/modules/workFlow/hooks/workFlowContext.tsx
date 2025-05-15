import React, { createContext, useContext, useState, ReactNode } from 'react';
import { defaultQualityApprovalProcess } from '../types/workFlowTypes';

// Define the shape of your context state
interface MyContextType {
    payloadData: any;
    setPayloadData: (payloadData: any) => void;
    showAlert: boolean;
    setShowAlert: (showAlert: boolean) => void;
    isAdding: boolean;
    setIsAdding: (showAlert: boolean) => void;
    activeTab: number;
    setActiveTab: (activeTab: number) => void;
    userGroupList: any;
    setUserGroupList: (userGroupList: any) => void;
}

// Create the context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [payloadData, setPayloadData] = useState<any>(defaultQualityApprovalProcess);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [userGroupList, setUserGroupList] = useState<any>([]);

    return (
        <MyContext.Provider value={{
            payloadData, setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding, activeTab, setActiveTab,
            userGroupList, setUserGroupList
        }}>
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
