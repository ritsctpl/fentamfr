import { ColumnGroupType, ColumnType } from "antd/es/table";

// Define the data structure for the shift intervals and breaks
export interface Certificate {
  certification: string;  // Ensure this property exists
  certificationDescription: string;  // Ensure this property exists
  // Add any additional properties that are required
}

export type DynamicColumn<T> = {
  title?: string;
  dataIndex?: keyof T;
  key: string;
  editable?: boolean;
  inputType?: 'text' | 'textarea';
};


interface SubStep {
  subStep: any;
  subStepDescription: any;
  // Define the properties of SubStep here
  // For example:
  id: string;
  description: string;
}

interface ActivityHook {
  hookPoint: any;
  activity: any;
  enable: any;
  userArgument: any;
  // Define the properties of ActivityHook here
  // For example:
  id: string;
  action: string;
}



export interface StageData {
  operation: string;
  revision: string;
  description: string;
  status: string;
  operationType: string;
  resourceType: string;
  defaultResource: string;
  erpOperation: string;
  addAsErpOperation: boolean;
  workCenter: string;
  currentVersion: boolean;
  maxLoopCount: number;
  certificationList: Certificate[];
  subStepList: SubStep[];
  activityHookList: ActivityHook[];
  operationCustomDataList: StageCustomData[];
  createdDateTime:string;
  modifiedDateTime:string;
}

 
  export type ColumnsType<RecordType = any> = (ColumnGroupType<RecordType> | ColumnType<RecordType>)[];

  export interface MainFormData {
  shiftName: string;
    description: string;
    shiftType: string;
    workCenter: string;
    resource: string;
  }

  export interface DecodedToken {
    preferred_username: string;
  }
  export interface StageCustomData {
    customData: string;
    value: string;
  }
  export const defaultStageData: StageData = {
    operation: '',
    revision: '',
    description: '',
    status: 'RELEASABLE', 
    operationType: 'Normal',  
    resourceType: '',
    defaultResource: '',
    erpOperation: '',
    addAsErpOperation: false,
    workCenter: '',
    currentVersion: false,
    maxLoopCount: 0,
    certificationList: [],
    subStepList: [],
    activityHookList: [],
    createdDateTime:'',
  modifiedDateTime:'',
    operationCustomDataList: [],
};

export interface DynamicTableProps {
  columns: any[];
  data: any[];
  currentPage: number;
  pageSize: number;
  handleRowClick: (record: any) => void;
  handleTableChange: (pagination: any, filters: any, sorter: any) => void;
  setCurrentPage: (page: number) => void;
  selectedRowKey: string | null;
}



export interface Break {
  uniqueId: number;
  breakId: number;
  breakType: string;
  breakTimeStart: string;
  breakTimeEnd: string;
  meanTime: number;
  reason: string;
}
export interface CalendarRule {
  day:string;
  prodDay:string;
  dayClass:string;
}
export interface CustomData {
}
export interface ShiftInterval {
  key: string;
  validFrom: string;
  validEnd: string;
  startTime: string;
  endTime: string;
  clockInStart: string;
  clockInEnd: string;
  clockOutStart: string;
  clockOutEnd: string;
  labourAssign: string;
  breakList: Break[];
}

export interface Data {
  shiftName: string;
  description: string;
  shiftType: string;
  workCenter: string;
  resource: string;
  erpShift?: boolean;
  startTime?: Date | null;
  endTime?: Date | null;
  calendarList :[];
  customData :[];
  shiftIntervals: [];
  createdDateTime?: Date;
  modifiedDateTime?: Date;
}
export const stageTypeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Special', label: 'Special' }
];

export const statusOptions = [
  { value: 'RELEASABLE', label: 'Releasable' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ARCHIVED', label: 'Archived' }
];

export const uiWc: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Work Center',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workcenter',
  tabledataApi: "workcenter-service"
};

export const uiResoureType: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Resource',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'resource',
  tabledataApi: "resourcetype-service"
};

export const uiDefaultResoureType: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Resource',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'resource',
  tabledataApi: "resource-service"
};