export interface ShopOrderRequest {
    site: string;
    shopOrder: string;
    status: string;
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
    priority: number;
    orderedQty: number;
    buildQty: string;
    qtyToRelease: number;
    plannedStart: Date;
    plannedCompletion: Date;
    scheduledStart: Date;
    scheduledEnd: Date;
    customerOrder: string;
    customer: string;
    availableQtyToRelease: string;
    userId: string;
    addToNewProcessLot: boolean;
  }

export const defaultShopOrderReleaseTypesRequest: ShopOrderRequest = {
    site: "",
    shopOrder: "",
    status: "",
    orderType: "",
    plannedMaterial: "",
    materialVersion: "",
    bomType: "",
    plannedBom: "",
    bomVersion: "",
    plannedRouting: "",
    routingVersion: "",
    lcc: "",
    plannedWorkCenter: "",
    priority: 0,
    orderedQty: 0,
    buildQty: "",
    plannedStart: undefined,
    plannedCompletion: undefined,
    scheduledStart: undefined,
    scheduledEnd: undefined,
    customerOrder: "",
    customer: "",
    availableQtyToRelease: "",
    userId: "",
    qtyToRelease: 0,
    addToNewProcessLot: false
};
