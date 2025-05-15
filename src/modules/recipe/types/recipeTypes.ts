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
  operationCustomDataList: OperationCustomData[];
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
  export interface OperationCustomData {
    customData: string;
    value: string;
  }
  export const defaultOperationData: OperationData = {
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
// options.ts
export const operationTypeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Special', label: 'Special' }
];

export const statusOptions = [
  { value: 'RELEASABLE', label: 'Releasable' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'New', label: 'New' }
];


// For Recipe page 

export interface Recipe {
  recipeId: string;
  recipeName: string;
  recipeDescription:string;
  version: string;
  batchSize: string;
  batchUom: string;
  totalExpectedCycleTime: string;
  totalActualCycleTime: string;
  user: string;
  status:string;
  active: number;
  scaling: Scaling;
  ingredients: Ingredients;
  phases: Phase[];
  workCenters: WorkCenter[];
  triggerPoints: TriggerPoint[];
  yieldTracking: YieldTracking;
  packagingAndLabeling: PackagingAndLabeling;
  adjustments: Adjustment[];
  safetyProcedures: SafetyProcedure[];
  operatorActions: OperatorAction[];
  compliance: Compliance;
  currentVersion:boolean;
  // userPhaseId: string;
  createdBy: string
createdDate: string
modifiedBy : string
modifiedDate: string 
}

interface Scaling {
  scalable: boolean;
  scalingFactor: string;
  maxBatchSize: string;
  minBatchSize: string;
}

interface Ingredients {
  active: Ingredient[];
  inactive: Ingredient[];
}

interface Ingredient {
  ingredientId: string;
  name: string;
  quantity: string;
  uom: string;
  materialDescription: string;
  storageLocation: string;
  tolerance: string;
  materialType: string;
  supplierId?: string;
  sourceLocation?: string;
  qcParameters?: QualityControlParameter[];
  handlingInstructions?: string;
  storageInstructions?: string;
  unitCost: string;
  currency?: string;
  totalCost: string;
  wasteQuantity?: string;
  wasteUoM?: string;
  byProduct?: ByProduct;
  hazardous?: boolean;
  alternateIngredients?: AlternateIngredient[];
}

export interface QualityControlParameter {
  id:string;
  parameter: string;
  value: string;
  tolerance: string;
}

interface ByProduct {
  byProductId: string;
  description: string;
  expectedQuantity: string;
  uom: string;
  handlingProcedure: string;
  sequence: string;
}

interface AlternateIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  uom: string;
  tolerance: string;
  materialDescription: string;
  storageLocation: string;
  materialType: string;
  batchNumber: string;
  expiryDate: string;
  manufactureDate: string;
  qcParameters?: QualityControlParameter[];
  unitCost: string;
  totalCost: string;
}

interface Phase {
  phaseId: string;
  phaseName: string;
  sequence: number;
  expectedCycleTime: string;
  ingredients: PhaseIngredient[];
  steps: Step[];
}

interface PhaseIngredient {
  ingredientId: string;
  name: string;
  quantity: string;
  sequence: number;
  associatedStep: string;
}

interface Step {
  stepId: string;
  stepName: string;
  sequence: number;
  instruction: string;
  type: string;
  expectedCycleTime: string;
  tools: string[];
  resources: Resource[];
  dataCollection: DataCollection[];
  qualityControlParameters: QualityControlParameter;
  adjustments: Adjustment[];
  ccp: boolean;
  criticalControlPoints: CriticalControlPoint;
  byProducts: ByProduct[];
}

export interface Resource {
  resourceId: string;
  description: string;
  workCenterId: string;
  parameters: {
    rpm: number;
    duration: string;
    pressure: string;
  };
}

interface DataCollection {
  dataPointId: string;
  description: string;
  frequency: string;
  expectedValueRange: string;
}

interface CriticalControlPoint {
  ccpId: string;
  description: string;
  criticalLimits: string;
  monitoringFrequency: string;
  correctiveAction: string;
}

interface Adjustment {
  adjustmentType: string;
  reason: string;
  impactOnProcess: string;
}

interface WorkCenter {
  workCenterId: string;
  description: string;
  resource: string;
  systemStatus: string;
  capacity: string;
  shiftDetails: string;
  operatorId: string;
  maintenanceSchedule: string;
  tooling: string[];
  calibrationStatus: string;
  targetCycleTime: string;
  locationId: string;
  zone: string;
  phasesHandled: string[];
}

interface TriggerPoint {
  triggerPointId: string;
  description: string;
  condition: string;
  sequence: string;
  action: string;
}

interface YieldTracking {
  expectedYield: string;
  allowedVariance: string;
  actualYield: string;
  byProducts: ByProduct[];
  waste: Waste[];
  corrections: Correction[];
  qualityDeviations: QualityDeviation[];
}

interface Waste {
  wasteId: string;
  description: string;
  quantity: string;
  uom: string;
  handlingProcedure: string;
  costOfDisposal: string;
}

interface Correction {
  correctionId: string;
  condition: string;
  action: string;
  impact: string;
}

interface QualityDeviation {
  deviationId: string;
  condition: string;
  impact: string;
  requiredAction: string;
  sequence: string;
}

interface PackagingAndLabeling {
  packagingType: string;
  primaryPackagingMaterial: string;
  secondaryPackagingType: string;
  containerSize: string;
  labelFormat: string;
  labelingRequirements: string[];
  labelLanguage: string[];
  complianceStandards: string[];
  instructions: string;
  environmentalRequirements: EnvironmentalRequirements;
}

interface EnvironmentalRequirements {
  storageTemperature: string;
  humidityRange: string;
  protectionFromLight: boolean;
}

interface SafetyProcedure {
  opId: string;
  sequence: string;
  riskFactor: string;
  mitigation: Mitigation[];
}

interface Mitigation {
  sequence: string;
  mitigationOp: string;
}

interface OperatorAction {
  actionId: string;
  description: string;
  operatorId: string;
  timestamp: string;
  notes: string;
}

interface Compliance {
  complianceId: string;
  description: string;
  complianceStatus: string;
  auditDate: string;
  auditResult: string;
  regulatoryAgencies: string[];
  auditRequired: boolean;
}



// for Active and Inactive 
// types.ts
export interface QCParameter {
  parameter: string;
  value: string;
  tolerance: string;
}

export const defaultIngredient: Ingredient = {
  ingredientId: "",
  name: "",
  quantity: "",
  uom: "",
  materialDescription: "",
  storageLocation: "",
  tolerance: "",
  materialType: "",
  supplierId: "",
  sourceLocation: "",
  qcParameters: [],
  handlingInstructions: "",
  storageInstructions: "",
  unitCost: "",
  currency: "",
  totalCost: "",
  wasteQuantity: "",
  wasteUoM: "",
  byProduct: {
    byProductId: "",
    description: "",
    expectedQuantity: "",
    uom: "",
    handlingProcedure: "",
    sequence: "",
  },
  hazardous: false,
  alternateIngredients: []
};

// Default Value for formData

export const defaultRecipe: Recipe = {
  recipeId: "",
  recipeName: "",
  recipeDescription:"",
  version: "",
  batchSize: "",
  batchUom: "",
  totalExpectedCycleTime: "",
  totalActualCycleTime: "",
  status:'New',
  user: "",
  active:1,
  createdBy: "",
  createdDate: "",
  modifiedBy : "",
  modifiedDate: "", 
  currentVersion:false,
  scaling: {
    scalable: false,
    scalingFactor: "",
    maxBatchSize: "",
    minBatchSize: "",
  },
  ingredients: {
    active: [],
    inactive: [],
  },
  phases: [],
  workCenters: [],
  triggerPoints: [],
  yieldTracking:
  {
    expectedYield: "",
    allowedVariance: "",
    actualYield: "",
    byProducts: [],
    waste: [],
    corrections: [],
    qualityDeviations: [],
  },
  packagingAndLabeling: {
    packagingType: "Box",
    primaryPackagingMaterial: "",
    secondaryPackagingType: "",
    containerSize: "",
    labelFormat: "",
    labelingRequirements: [],
    labelLanguage: [],
    complianceStandards: [],
    instructions: "",
    environmentalRequirements: {
      storageTemperature: "",
      humidityRange: "",
      protectionFromLight: false,
    },
  },
  adjustments: [],
  safetyProcedures: [],
  operatorActions: [],
  compliance: {
    complianceId: "",
    description: "",
    complianceStatus: "",
    auditDate: "",
    auditResult: "",
    regulatoryAgencies: [],
    auditRequired: false,

  },
  // userPhaseId: "",
};