export interface MultiProcessOrderReleaseRequest {
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
  }

export const defaultMultiProcessOrderReleaseTypesRequest: MultiProcessOrderReleaseRequest = {
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
