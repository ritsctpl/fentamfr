export interface AlternateComponent {
  alternateComponent?: string;
  alternateComponentVersion?: string;
  enabled?: boolean;
  validfromDateTime?: string;
  validToDateTime?: string;
}

export interface ComponentCustomData {
  customData?: string;
  value?: string;
}

export interface BomComponent {
  assySequence?: string;
  component?: string;
  componentVersion?: string;
  componentType?: string;
  componentDescription?: string;
  assyOperation?: string;
  assyQty?: string;
  assemblyDataTypeBo?: string;
  storageLocationBo?: string;
  maxUsage?: string;
  maxNc?: string;
  alternateComponentList?: AlternateComponent[];
  componentCustomDataList?: ComponentCustomData[];
}

export interface BomRequestProps {
  site?: string;
  bom?: string;
  revision?: string;
  description?: string;
  status?: string;
  bomType?: string;
  currentVersion?: boolean;
  validFrom?: string;
  validTo?: string;
  bomTemplate?: boolean;
  isUsed?: boolean;
  designCost?: any;
  operation?: string;
  bomComponentList?: BomComponent[];
  bomCustomDataList?: BomCustomData[];
  userId?: string;
}

export interface BomCustomData {
  key: number;
  customData: string;
  value: string;
}

// Default values for additional interfaces
export const defaultAlternateComponent: AlternateComponent = {
  alternateComponent: '',
  alternateComponentVersion: '',
  enabled: false,
  validfromDateTime: '',
  validToDateTime: '',
};

export const defaultComponentCustomData: ComponentCustomData = {
  customData: '',
  value: '',
};

export const defaultBomComponent: BomComponent = {
  assySequence: '',
  component: '',
  componentVersion: '',
  componentDescription: '',
  componentType: 'Normal',
  assyQty: '',
  maxNc: '',
  maxUsage: '',
  assyOperation: '',
  assemblyDataTypeBo: '',
  storageLocationBo: '',
  alternateComponentList: [],
  componentCustomDataList: [defaultComponentCustomData],
};

export const defaultBomRequestProps: BomRequestProps = {
  site: '',
  bom: '',
  revision: '',
  description: '',
  status: 'New',
  bomType: 'Master',
  currentVersion: false,
  validFrom: '',
  validTo: '',
  bomTemplate: false,
  isUsed: false,
  designCost: '',
  operation: '',
  bomComponentList: [],
  bomCustomDataList: [],
  userId: '',
};

