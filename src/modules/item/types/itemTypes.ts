export interface CustomData {
    customData: string;
    value: string;
}

export interface ItemData {
    site: string;
    item: string;
    revision: string;
    description: string;
    itemGroup: string;
    status: string;
    procurementType: string;
    currentVersion: boolean;
    itemType: string;
    lotSize: number;
    routing: string;
    routingVersion: string;
    bom: string;
    bomVersion: string;
    bomBO: string | null;
    routingBO: string | null;
    assemblyDataType: string;
    removalDataType: string;
    receiptDataType: string;
    printDocuments: any[]; // Adjust type if needed
    customDataList: CustomData[];
    alternateComponentList: any[]; // Adjust type if needed
    inUse: boolean;
    active: number;
    createdBy: string;
    modifiedBy: string;
    createdDateTime: string; // Use Date type if you handle parsing
    modifiedDateTime: string; // Use Date type if you handle parsing
}


export const defaultItemData: ItemData = {
    site: "",
    item: "",
    revision: "",
    description: "",
    itemGroup: "",
    status: "New",
    procurementType: "Manufactured",
    currentVersion: true,
    itemType: "Manufactured",
    lotSize: 1,
    routing: "",
    routingVersion: "",
    bom: "",
    bomVersion: "",
    bomBO: null,
    routingBO: null,
    assemblyDataType: "",
    removalDataType: "",
    receiptDataType: "",
    printDocuments: [],
    customDataList: [
        {
            customData: "",
            value: ""
        }
    ],
    alternateComponentList: [],
    inUse: false,
    active: 1,
    createdBy: "",
    modifiedBy: "",
    createdDateTime: "",
    modifiedDateTime: ""
};
