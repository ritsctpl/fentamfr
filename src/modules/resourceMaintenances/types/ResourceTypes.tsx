// Define interfaces for the data structures

export interface ResourceTypeList {
    resourceType: string;
}

export interface CertificationList {
    certificationBO: string;
    certificationDescription: string;
}

export interface OpcTagList {
    tagName: string;
    tagUrl: string;
    identity: string;
}

export interface ResourceCustomDataList {
    customData: string;
    value: string;
}

export interface ActivityHook {
    hookPoint: string;
    activity: string;
    enable: boolean;
    userArgument: string;
}

export interface ResourceRequest {
    site: string;
    resource: string;
    description: string;
    status: string;
    defaultOperation: string;
    processResource: boolean;
    erpEquipmentNumber: string;
    erpPlantMaintenanceOrder: string;
    validFrom: string;
    validTo: string;
    resourceTypeList: ResourceTypeList[];
    certificationList: CertificationList[];
    opcTagList: OpcTagList[];
    resourceCustomDataList: ResourceCustomDataList[];
    activityHookList: ActivityHook[];
    userId: string;
    activity: string;
    setUpState: string;
}

export const defaultResourceRequest: ResourceRequest = {
    site: "",
    resource: "",
    description: "",
    status: "Enabled", 
    defaultOperation: "",
    processResource: false,
    erpEquipmentNumber: "",
    erpPlantMaintenanceOrder: "",
    validFrom: "", 
    validTo:  "",
    resourceTypeList: [],
    certificationList: [],
    opcTagList: [],
    resourceCustomDataList: [],
    activityHookList: [],
    userId: "",
    activity: "",
    setUpState: "",
};
