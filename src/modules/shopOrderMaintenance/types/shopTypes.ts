import { ColumnGroupType, ColumnType } from "antd/es/table";



export type DynamicColumn<T> = {
  title?: string;
  dataIndex?: keyof T;
  key: string;
  editable?: boolean;
  inputType?: 'text' | 'textarea';
};

 
  export type ColumnsType<RecordType = any> = (ColumnGroupType<RecordType> | ColumnType<RecordType>)[];



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
  

  export interface DecodedToken {
    preferred_username: string;
  }
export interface CustomData {
  customData: string;
    value: string;
}





export interface MainData {
  
}

// Shop Order type

export interface ShopOrder {
  [key: string]: any;
  site: string;
  shopOrder: string;
  status: string;
  description: string;
  orderType: string;
  plannedMaterial: string;
  materialVersion: string;
  bomType: string;
  plannedBom: string;
  bomVersion: string;
  plannedRouting: string;
  routingVersion: string;
  lcc: string;
  plannedWorkCenter: string;
  priority: string;
  orderedQty: string;
  buildQty: string;
  erpUom: string;
  plannedStart: string; // Use ISO 8601 date format
  plannedCompletion: string; // Use ISO 8601 date format
  scheduledStart: string | null; // Use ISO 8601 date format or null
  scheduledEnd: string | null; // Use ISO 8601 date format or null
  customerOrder: string;
  customer: string;
  productionQuantities: ProductionQuantity[];
  serialPcu: SerialPcu[];
  customDataList: any[]; // Adjust type as needed if more structure is known
}

export interface ProductionQuantity {
  orderedQty: string;
  defineDeliveryToleranceIn: string;
  underDeliveryTolerance: string;
  underDeliveryMaximumDeliveryQty: string; // Missing property added
  overDeliveryTolerance: string;
  overDeliveryMaximumDeliveryQty: string;
  unlimitedOverDelivery: boolean; // Updated type from string to boolean
  doneQty: string;
  buildQty: string;
  recommendedBuildQtyToReachOrderedQty: string;
  recommendedBuildQtyToReachMinimumDeliveryQty: string;
  releasedQty: string;
  qtyInQueueOrWork: string;
  scrappedQty: string;
  unreleasedQty: string;
}


export interface SerialPcu {
  count: number;
  serialNumber: string;
  pcuNumber: string;
  pcuQuantity: string;
  state: string;
  enabled: boolean;
}


// Default values for ShopOrder
export const defaultShopOrder: ShopOrder = {
  site: "",
  shopOrder: "",
  status: "Releasable",
  description: "",
  orderType: "Production",
  plannedMaterial: "",
  materialVersion: "",
  bomType: "Master", // assuming "Single-Level" as a sensible default
  plannedBom: "",
  bomVersion: "",
  plannedRouting: "",
  routingVersion: "",
  lcc: "",
  plannedWorkCenter: "",
  priority: "1", // assuming "1" as a default priority
  orderedQty: "0",
  buildQty: "1",
  erpUom: "Each",
  plannedStart: "", // current date-time as default
  plannedCompletion:"", // current date-time as default
  scheduledStart: null,
  scheduledEnd: null,
  customerOrder: "",
  customer: "",
  productionQuantities: [{
    "orderedQty": "0", // string
    "defineDeliveryToleranceIn": "", // Added this property as it was missing
    "underDeliveryTolerance": "0", // string
    "underDeliveryMaximumDeliveryQty": "0", // string (added the missing property)
    "overDeliveryTolerance": "0", // string
    "overDeliveryMaximumDeliveryQty": null, // should be a string; adjust if necessary
    "unlimitedOverDelivery": false, // boolean
    "doneQty": "", // string
    "buildQty": "0", // string (changed from null to "0" for consistency)
    "recommendedBuildQtyToReachOrderedQty": "", // string
    "recommendedBuildQtyToReachMinimumDeliveryQty": "", // string
    "releasedQty": "20.0", // string
    "qtyInQueueOrWork": "", // string
    "scrappedQty": "", // string
    "unreleasedQty": "" // string
}
],
  serialPcu: [],
  customDataList: []
};

export interface FormValues {
  [key: string]: any;
  site?: string;
  shopOrder?: string;
  status?: string;
  description?: string;
  orderType?: string;
  plannedMaterial?: string;
  materialVersion?: string;
  bomType?: string;
  plannedBom?: string;
  bomVersion?: string;
  plannedRouting?: string;
  routingVersion?: string;
  lcc?: string;
  plannedWorkCenter?: string;
  priority?: number;
  orderedQty?: number;
  buildQty?: number;
  erpUom?: string;
  plannedStart?: string;
  plannedCompletion?: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  customerOrder?: string;
  customer?: string;
  productionQuantities?: any[];
  serialSfc?: any[];
  customDataList?: any[];
}



// DropDown Value

export const statusOptions = [
  { value: 'Releasable', label: 'Releasable' },
  { value: 'Done', label: 'Done' },
  { value: 'Hold', label: 'Hold' },
  { value: 'Closed', label: 'Closed' }
];
export const orderTypeOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Rework', label: 'Rework' },
  { value: 'Production', label: 'Production' },
  { value: 'Repetitive', label: 'Repetitive' },
  { value: 'RVA', label: 'RVA' },
  { value: 'Tool ng', label: 'Tool ng' },
  { value: 'Spare', label: 'Spare' },
  { value: 'Installator', label: 'Installator' }
];
export const bomTypeOptions = [
  { value: 'Master', label: 'Master' },
  { value: 'Shop Order', label: 'Shop Order' },
  { value: 'SFC', label: 'SFC' }
];

export const uiPlaner: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Planner Material',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workcenter',
  tabledataApi: "item-service"
};
export const uiPlanerRouter: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Planner Routing',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workcenter',
  tabledataApi: "routing-service"
};
export const uiPlanerBom: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Planner Bom',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workcenter',
  tabledataApi: "bom-service"
};

export const uiPlanerWc: any = {
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