import { createContext } from "react";



interface CombinedContextType {
   

    selectedRow: any;
    setSelectedRow: (value: any) => void;

    showUserLogin: boolean;
    setShowUserLogin: (value: boolean) => void;

    buyoffList: any;
    setBuyoffList: (value: any) => void;

    comments: string;
    setComments: (value: string) => void;

    selectedBuyOffRow: any;

    reloadBuyOffList: number;
    setReloadBuyOffList: (value: number) => void;

    selectedRowKey: string | null;
    setSelectedRowKey: (value: string | null) => void;

    reloadBuyOff: boolean;
    setReloadBuyOff: (value: boolean) => void;
   
}
export const LogBuyOffContext = createContext<CombinedContextType | undefined>(undefined);
