import { createContext } from "react";


interface CombinedContextType {

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

  selectedAttachmnetRowKeys: any;
  setSelectedAttachmnetRowKeys: (boolean) => void;

  attachmentRowSelectedData: any;
  setAttachmentRowSelectedData: (boolean) => void;
  
  isAttachmentVisible: any;
  setIsAttachmentVisible: (boolean) => void;
  
  isMainPageVisible: any;
  setIsMainPageVisible: (boolean) => void;

  insertClickBooleanForAttachment: boolean;
  setInsertClickBooleanForAttachment: (boolean) => void;

  insertClickForAttachment: number;
  setInsertClickForAttachment: (number) => void;
  
}
export const ToolGroupContext = createContext<CombinedContextType | undefined>(undefined);
