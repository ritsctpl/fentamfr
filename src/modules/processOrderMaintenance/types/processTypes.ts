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


export interface SerialNumber {
  count: number;
  serialNumber: string;
  batchNumber: string;
  batchNumberQuantity: string;
  state: string;
  enabled: boolean;
}

// Default values for ProcessOrder
export const defaultProcessOrder: FormValues = {
  site: "",
  userId: "",
  priority: "",
  // inUse: true,
  availableQtyToRelease: "",
  orderNumber: "",
  status: "Releasable",
  orderType: "Production",
  material: "",
  materialVersion: "",
  recipe: "",
  recipeVersion: "",
  targetQuantity: 0,
  unit: "",
  startDate: "",
  finishDate: "",
  schedFinTime: "",
  schedStartTime: "",
  batchNumber: [],
};

export interface FormValues {
  [key: string]: any;
  site?: string;
  userId?: string;
  orderNumber?: string;
  status?: string;
  orderType?: string;
  material?: string;
  materialVersion?: string;
  recipe?: string;
  recipeVersion?: string;
  targetQuantity?: number;
  unit?: string;
  startDate?: string;
  finishDate?: string;
  schedFinTime?: string;
  schedStartTime?: string;
  priority?: string;
  // inUse?: boolean;
  availableQtyToRelease?: string;
  batchNumber?: [];
}

// DropDown Value

export const statusOptions = [
  { value: 'Releasable', label: 'Releasable' },
  { value: 'Done', label: 'Done' },
  { value: 'Hold', label: 'Hold' },
  { value: 'Closed', label: 'Closed' }
];

export const inUseOptions = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' }
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
  { value: 'Process Order', label: 'Process Order' },
  { value: 'SFC', label: 'SFC' }
];

export const uomOptions = [
  { value: 'Kg', label: 'Kg' },
  { value: 'Litre', label: 'Litre' },
  { value: 'Count', label: 'Count' },
  { value: 'Meter', label: 'Meter' },
  { value: 'Piece', label: 'Piece' },
  { value: 'Ton', label: 'Ton' },
  { value: 'Millilitre', label: 'Millilitre' },
  { value: 'Gram', label: 'Gram' },
  { value: 'Centimetre', label: 'Centimetre' },
  { value: 'Dozen', label: 'Dozen' },
];

export const uiPlaner: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'selectMaterial',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workcenter',
  tabledataApi: "item-service"
};
export const uiRecipeNo: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'selectRecipeNo',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'retrieveAll',
  tabledataApi: "recipe-service"
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