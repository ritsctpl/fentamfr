import { ColumnGroupType, ColumnType } from "antd/es/table";
import exp from "constants";
import { parseCookies } from "nookies";

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
};2


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
  customData: string;
    value: string;
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



// For User Type

interface UserGroup {
  userGroup: string; // Adjust based on actual fields
}

interface WorkCenter {
  // Define properties based on your requirements
}

interface LabourTracking {
  current: number;
  validFrom: string;
  validTo: string;
  userType: string;
  primaryShift: string;
  secondaryShift: string;
  costCenter: string;
  defaultLCC: string;
  department: string;
  details: string;
}

interface Supervisor {
  current: number;
  validFrom: string;
  validTo: string;
  supervisedCcs: string;
}

interface LabourRules {
  labourRule: string;
  currentValue: number;
}



export interface User {
  site:string;
  defaultSite: string;
  user: string;
  lastName: string;
  firstName: string;
  emailAddress: string | null;
  status: string;
  employeeNumber: string | null;
  hireDate: string | null;
  erpUser: string | null;
  erpPersonnelNumber: string | null;
  details: string | null;
  userGroups: UserGroup[];
  workCenters: WorkCenter[] | null;
  labourTracking: LabourTracking[] | null;
  supervisor: Supervisor[] | null;
  labourRules: LabourRules[] | null;
  customDataList: CustomData[] | null;
  userId: string | null;
  active: number;
  createdDateTime: string; // Can be ISO date string
  modifiedDateTime: string; // Can be ISO date string
}
const cookies = parseCookies();
      const currentSite = cookies.site;

export const DefaultUserData: User = {
  site:'',
  defaultSite: currentSite,
  user: "",
  lastName: '',
  firstName: '',
  emailAddress: null,
  status: 'Active',
  employeeNumber: null,
  hireDate: null,
  erpUser: null,
  erpPersonnelNumber: null,
  details:"",
  userGroups: [], // Empty array for nested objects
  workCenters: [], // Empty array, adjust based on actual WorkCenter definition
  labourTracking: [], // Empty array, adjust based on actual LabourTracking definition
  supervisor: [], // Empty array, adjust based on actual Supervisor definition
  labourRules: [], // Empty array, adjust based on actual LabourRules definition
  customDataList: [], // Empty array, adjust based on actual CustomData definition
  userId: null,
  active: 0, // Default to inactive or neutral state
  createdDateTime: '', // Empty string or a placeholder like 'N/A'
  modifiedDateTime: '', // Empty string or a placeholder like 'N/A'
};

export interface OperationData {
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
  operationCustomDataList: [];
  createdDateTime:string;
  modifiedDateTime:string;
}

export const tabDatas =[
  {
    tabname: 'OEE'
},
{
    tabname: 'DownTime'
},
{
    tabname: 'Performance'
},
{
    tabname: 'Availability'
},
{
    tabname: 'Quality'
}
]

export const optionsByTab = {
  OEE: [
      "OEE_Over_Time",
      "OEE_by_Machine",
      "OEE_by_Shift",
      "OEE_Breakdown",
      "OEE_Loss_by_Reason",
      "OEE_by_Production_Line",
      "OEE_by_Product",
      "OEE_Component_Trend_Over_Time",
  ],
  DownTime: [
      "Downtime_Overall_Percentage",
      "Downtime_Over_Time",
      "Downtime_by_Reason",
      "Downtime_by_Machine",
      "Downtime_by_Reason_and_Shift",
      "Cumulative_Downtime",
      "Downtime_vs_Production_Output",
      "Downtime_Analysis",
      "Performance_Metrics",
      "Downtime_Impact",
      "Downtime_Duration_Distribution",
  ],
  Availability: [
      "Availability_Overall_Percentage",
      "Availability_Over_Time",
      "Availability_by_Shift",
      "Availability_by_Machine",
      "Availability_Downtime_Pareto",
      "Downtime_Heatmap",
  ],
  Performance: [
      "Performance_Overall_Percentage",
      "Performance_Over_Time",
      "Performance_by_Shift",
      "Performance_by_Machine",
      "Performance_by_Production_Line",
      "Performance_Loss_Reasons",
      "Performance_Efficiency_by_Product",
      "Performance_Downtime_Analysis",
      "Performance_Comparison",
  ],
  Quality: [
      "Quality_Overall_Percentage",
      "Quality_Over_Time",
      "Quality_by_Shift",
      "Quality_by_Machine",
      "Quality_by_Product",
      "Defects_by_Reason",
      "Quality_Loss_by_Production_Line",
      "Quality_by_Operator",
      "Defect_Distribution_by_Product",
      "Defect_Trend_Over_Time",
  ]
};