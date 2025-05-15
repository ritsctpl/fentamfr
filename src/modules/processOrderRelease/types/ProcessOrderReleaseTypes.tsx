export interface ProcessOrderRequest {
    site: string;
    status: string;
    userId: string;
    orderType: string;
    orderNumber: string;
    material: string;
    materialVersion: string;
    recipe: string;
    recipeVersion: string;
    mrpController: string;
    productionScheduler: string;
    reservationNumber: string;
    productionStartDate: string;
    productionFinishDate: string;
    actualStartDate: string;
    actualFinishDate: string;
    targetQuantity: string;
    priority: number;
    qtyToRelease: number;
    inUse: string;
    availableQtyToRelease: string;
    uom: string;
    measuredUom: string;




    // shopOrder: string;
    // status: string;
    // orderType: string;
    // plannedMaterial: string;
    // materialVersion: string;
    // bomType: string;
    // plannedBom: string;
    // bomVersion: string;
    // plannedRouting: string;
    // routingVersion: string;
    // lcc: string;
    // plannedWorkCenter: string;
    // priority: number;
    // orderedQty: number;
    // buildQty: string;
    // qtyToRelease: number;
    // plannedStart: Date;
    // plannedCompletion: Date;
    // scheduledStart: Date;
    // scheduledEnd: Date;
    // customerOrder: string;
    // customer: string;
    // availableQtyToRelease: string;
    // userId: string;
    // addToNewProcessLot: boolean;
  }

export const defaultProcessOrderReleaseTypesRequest: ProcessOrderRequest = {
  // shopOrder: "",
  // status: "",
  // orderType: "",
  // plannedMaterial: "",
  // materialVersion: "",
  // bomType: "",
  // plannedBom: "",
  // bomVersion: "",
  // plannedRouting: "",
  // routingVersion: "",
  // lcc: "",
    // plannedWorkCenter: "",
    // priority: 0,
    // orderedQty: 0,
    // buildQty: "",
    // plannedStart: undefined,
    // plannedCompletion: undefined,
    // scheduledStart: undefined,
    // scheduledEnd: undefined,
    // customerOrder: "",
    // customer: "",
    // availableQtyToRelease: "",
    // userId: "",
    // qtyToRelease: 0,
    // addToNewProcessLot: false
    
    
    site: "",
    status: "",
    userId: "",
    orderType: "",
    orderNumber: "",
    material: "",
    materialVersion: "",
    recipe: "",
    recipeVersion: "",
    mrpController: "",
    productionScheduler: "",
    reservationNumber: "",
    productionStartDate: "",
    productionFinishDate: "",
    actualStartDate: "",
    actualFinishDate: "",
    targetQuantity: "",
    priority: 0,
    availableQtyToRelease: "",
    qtyToRelease: 0,
    inUse: "",
    uom: "",
    measuredUom: "",
};
