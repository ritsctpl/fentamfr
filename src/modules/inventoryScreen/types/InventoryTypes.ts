
// Define the SiteRequest interface
export interface InventoryRequest {
  inventoryId: string;
  description: string;
  status: string | null;
  item: string;
  version: string;
  receiveQty: number;
  qty: number;
  originalQty: number;
  remainingQty: number;
  receiveDateOrTime: string | null;
  receiveBy: string | null;
  tags: string | null;
  inventoryIdDataDetails: string | null;
  inventoryIdLocation: any;
  usageCount: number;
  maximumUsageCount: number;
  inUsage: boolean;
  splittedInventory: boolean;
  parentInventoryId: string | null;
  partitionDate: string | null;
  active: number;
  createdDateTime: string;
  modifiedDateTime: string;

}

export const DefaultInventoryData: InventoryRequest = { 
    inventoryId: '',
    description: '',
    status: null,
    item: '',
    version: '',
    receiveQty: 0,
    qty: 0,
    originalQty: 0,
    remainingQty: 0,
    receiveDateOrTime: null,
    receiveBy: null,
    tags: null,
    inventoryIdDataDetails: null,
    inventoryIdLocation: null,
    usageCount: 0,
    maximumUsageCount: 0,
    inUsage: false,
    splittedInventory: false,
    parentInventoryId: null,
    partitionDate: null,
    active: 0,
    createdDateTime: '',
    modifiedDateTime: ''
  };