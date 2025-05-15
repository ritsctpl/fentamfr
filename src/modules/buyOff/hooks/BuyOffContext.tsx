import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface BuyOffData {
  id: string;
  site: string;
  buyOff: string;
  version: string;
  description: string;
  status: string;
  messageType: string;
  partialAllowed: boolean;
  rejectAllowed: boolean;
  skipAllowed: boolean;
  currentVersion: boolean;
  createdDateTime: string;
  modifiedDateTime: string;
  userGroupList: any[];
  attachmentList: any[];
  customDataList: any[];
}

interface BuyOffContextType {
  selectedRowData: BuyOffData | null;
  setSelectedRowData: (data: BuyOffData | null) => void;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  fullScreen: boolean;
  setFullScreen: (fullScreen: boolean) => void;
  resetForm: () => void;
  attachment: boolean;
  setAttachment: (attachment: boolean) => void;
  create: boolean;
  setCreate: (create: boolean) => void;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

const BuyOffContext = createContext<BuyOffContextType | undefined>(undefined);

export function BuyOffProvider({ children }: { children: ReactNode }) {
  const [selectedRowData, setSelectedRowData] = useState<BuyOffData | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [attachment, setAttachment] = useState<boolean>(false);
  const [create, setCreate] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState(false);

  const resetForm = () => {
    setSelectedRowData(null);
    setIsAdding(false);
    setFullScreen(false);
  };

  return (
    <BuyOffContext.Provider
      value={{
        selectedRowData,
        setSelectedRowData,
        isAdding,
        setIsAdding,
        fullScreen,
        setFullScreen,
        resetForm,
        attachment,
        setAttachment,
        create,
        setCreate,
        hasChanges,
        setHasChanges
      }}
    >
      {children}
    </BuyOffContext.Provider>
  );
}

export function useBuyOff() {
  const context = useContext(BuyOffContext);
  if (context === undefined) {
    throw new Error('useBuyOff must be used within a BuyOffProvider');
  }
  return context;
} 