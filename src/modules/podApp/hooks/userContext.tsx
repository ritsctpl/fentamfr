import { createContext } from "react";
import { PodConfig } from "../types/userTypes";


interface CombinedContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    erpShift: boolean;
    setErpShift: (value: boolean) => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    formData:PodConfig;
    setFormData :(value: Object) => void;
    filterFormData:PodConfig;
    selectedRowData:any[];
    setSelectedRowData:(value: []) => void;
    setData :(value: Object) => void;
    data:any;
    setFilterFormData :(value: Object) => void;
    call:number;
    setCall :(value: number) => void;
    workStation:string;
    tabOut:string;
    setTabOut:(value:string) => void;
    podCategoryType:string;
    selectedRowDataCurrent:any;
    setSelectedRowCurrent:(value: []) => void;
    phaseIdd:string;
    setPhaseId:(value:string) => void;
    operationIdd:string;
    setOperationIdd:(value:string) => void;
    buttonId:string;
    setButtonId:(value:string) => void;
    
    error:string;
    setError:(value:string) => void;

    phaseByDefault: any;
    setPhaseByDefault:(value:any) => void;

    call1:number;
    setCall1:(value:number) => void;

    batchNoTabOut:number;
    setBatchNoTabOut:(value:number) => void;
    list:any;
    setList:(value:any) => void;
    loading:boolean;
    setLoading:(value:boolean) => void;

    activityId:string;
    setActivityId:(value:string) => void;
  }
export const PodContext = createContext<CombinedContextType | undefined>(undefined);


