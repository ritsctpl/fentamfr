import { createContext } from "react";
import { RoutingData } from "../types/routingTypes";


interface CombinedContextType {


  // formData:RoutingData;
  // setFormData :(value: Object) => void;


  // activeTab:number;
  // setActiveTab :(value: number) => void;

  schema: object;
  stepSchema: object;

  payloadData: object;
  setPayloadData: (value: Object) => void;

  isNextPage: boolean;
  setIsNextPage: (boolean) => void;

  isStepModalVisible: boolean;
  setIsStepModalVisible: (boolean) => void;

  formSchema: object;
  setFormSchema: (value: Object) => void;

  username: string;

  isAdding: boolean;

  fullScreen: boolean;
  setFullScreen: (boolean) => void;

  showAlert: boolean;
  setShowAlert: (any) => void;

  selectedRowKeys: any;
  setSelectedRowKeys: (any) => void;

  rowSelectedData: any;
  setRowSelectedData: (any) => void;

  tableData: any;
  setTableData: (any) => void;

  activeTab: any;
  setActiveTab: (any) => void;

  insertClick: any;
  setInsertClick: (any) => void;

  insertClickBoolean: any;
  setInsertClickBoolean: (any) => void;

  isRowSelected: any;
  setIsRowSelected: (any) => void;

  isOperationRowSelected: any;
  setIsOperationRowSelected: (any) => void;

  isStepRowClicked: any;
  setIsStepRowClicked: (number) => void;
}
export const RoutingContext = createContext<CombinedContextType | undefined>(undefined);
