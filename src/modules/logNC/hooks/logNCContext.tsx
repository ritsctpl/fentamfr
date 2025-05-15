import { createContext } from "react";



interface CombinedContextType {
    showDataFields: boolean;
    setShowDataFields: (value: boolean) => void;

    ncCodeValue: string;
    setNcCodeValue: (value: string) => void;

    ncDataTypeValue: string;
    setNcDataTypeValue: (value: string) => void;

    dataFieldsValue: any;
    setDataFieldsValue: (value: any) => void;

    selectedNcRow: any;
    setSelectedNcRow: (value: any) => void;

    ncCodeList: any;
    setNcCodeList: (value: any) => void;

    selectedNcGroupRowKey: any;
    setSelectedNcGroupRowKey: (value: any) => void;

    selectedNcCodeRowKey: any;
    setSelectedNcCodeRowKey: (value: any) => void;

    selectedNcTreeRowKey: any;
    setSelectedNcTreeRowKey: (value: any) => void;

    isNcTreeSelected: boolean;
    setIsNcTreeSelected: (value: boolean) => void;

    oGetAllNcByPCUResponse: any;
    setOGetAllNcByPCUResponse: (value: any) => void;

    childNC: any;
    setChildNC: (value: any) => void;

    parentNC: any;
    setParentNC: (value: any) => void;

    count: number;
    setCount: (value: number) => void;

    oParentNC: any;

    oChildNC: any;

    tranformDataFields: any;
    setTranformDataFields: (value: any) => void;
}
export const LogNCContext = createContext<CombinedContextType | undefined>(undefined);

