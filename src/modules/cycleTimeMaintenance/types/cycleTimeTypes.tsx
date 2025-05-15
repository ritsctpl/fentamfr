export interface ResourceData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface ResourceTypeData {
  id: number;
  resourceType: string;
  description: string;
}

export interface WorkCenterData {
  id: number;
  workCenter: string;
  description: string;
}

export interface OperationData {
  id: number;
  operation: string;
  revision: string;
  description: string;
  status: string;
}

export interface MaterialData {
  id: number;
  item: string;
  revision: string;
  description: string;
  status: string;
}

export interface CycleTimeRequest {
    site: string;
    operation: string;
    operationVersion: string;
    resource: string;
    resourceType: string;
    // material: string;
    // materialVersion: string;
    item: string;
    itemVersion: string;
    targetQuantity: number;
    itemId: string;
    workCenter: string;
    time: string;
    cycleTime: any;
    manufacturedTime: any;
    userId: string;
  }
  
export  const defaultCycleTimeRequest: CycleTimeRequest = {
    site: '',
    operation: '',
    operationVersion: '',
    resource: '',
    resourceType: '',
    // material: '',
    // materialVersion: '',
    item: '',
    itemVersion: '',
    itemId: '',
    targetQuantity: 0,
    workCenter: '',
    time: '',
    cycleTime: '',
    manufacturedTime: '',
    userId: ''
  };