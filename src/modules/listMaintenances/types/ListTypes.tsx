
export interface ListMaintenanceRequest {
    category: string;
    list: string;
    description: string;
    maximumNumberOfRow: string;  
    type: string;
    allowOperatorToChangeColumnSequence: boolean;  
    allowOperatorToSortRows: boolean;  
    allowMultipleSelection: boolean;  
    showAllActiveSfcsToOperator: boolean; 
    columnList: any;
}

export const defaultListRequest: ListMaintenanceRequest = {
    category: "POD Work List",
    list: "",
    description: "",
    maximumNumberOfRow: "",  
    type: "PCU",
    allowOperatorToChangeColumnSequence: false,  
    allowOperatorToSortRows: false,  
    allowMultipleSelection: false,  
    showAllActiveSfcsToOperator: false ,
    columnList:[]
}
