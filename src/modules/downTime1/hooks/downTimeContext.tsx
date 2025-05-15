import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context state
interface MyContextType {
    showAlert: boolean;
    setShowAlert: (showAlert: boolean) => void;
    isAdding: boolean;
    setIsAdding: (showAlert: boolean) => void;
    activeTab: number;
    setActiveTab: (activeTab: number) => void;
    userGroupList: any;
    setUserGroupList: (userGroupList: any) => void;
    triggerPlannedDTLoad: number;
    setTriggerPlannedDTLoad: (triggerPlannedDTLoad: number) => void;
    triggerPlannedDTEdit: number;
    setTriggerPlannedDTEdit: (triggerPlannedDTEdit: number) => void;
    triggerToCreate: number;
    setTriggerToCreate: (triggerToCreate: number) => void;
}

// Create the context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [userGroupList, setUserGroupList] = useState<any>([]);
    const [triggerPlannedDTLoad, setTriggerPlannedDTLoad] = useState<any>(0);
    const [triggerPlannedDTEdit, setTriggerPlannedDTEdit] = useState<any>(0);
    const [triggerToCreate, setTriggerToCreate] = useState<any>(0);

    return (
        <MyContext.Provider value={{
            showAlert, setShowAlert, isAdding, setIsAdding, activeTab, setActiveTab,
            userGroupList, setUserGroupList, triggerPlannedDTLoad, setTriggerPlannedDTLoad, triggerPlannedDTEdit,
            setTriggerPlannedDTEdit, triggerToCreate, setTriggerToCreate,
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
