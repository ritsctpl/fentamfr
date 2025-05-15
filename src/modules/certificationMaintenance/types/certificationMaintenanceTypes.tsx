export interface UserGroup {
    userGroup: string;
}

export interface CustomData {
    customData: string;
    value: string;
}

export interface CertificationMaintenanceRequest {
    site: string;
    certification: string;
    description: string;
    duration: string;
    durationType: string;
    status: string;
    maxNumberOfExtensions: string;
    maxExtensionDuration: string;
    userGroupList: UserGroup[];
    customDataList: CustomData[];
    createdDateTime: string;
    modifiedDateTime: string | null;
}

export const defaultUserGroup: UserGroup = {
    userGroup: ""
};

export const defaultCertificationMaintenanceRequest: CertificationMaintenanceRequest = {
    site: "",
    certification: "",
    description: "",
    duration: "",
    durationType: "",
    status: "",
    maxNumberOfExtensions: "",
    maxExtensionDuration: "",
    userGroupList: [],
    customDataList: [],
    createdDateTime: "",
    modifiedDateTime: null
};