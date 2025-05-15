export interface ResourceMemberList {
    resource: string;
}

export interface ExtendedResourceTypeRequest {
    handle: string;
    site: string;
    resourceType: string;
    resourceTypeDescription: string;
    resourceMemberList: ResourceMemberList[];
    active: number;
    createdDateTime: string;
    modifiedDateTime: string;
}

export const defaultResourceMemberList: ResourceMemberList = {
    resource: ""
};

export const defaultExtendedResourceTypeRequest: ExtendedResourceTypeRequest = {
    handle: "",
    site: "",
    resourceType: "",
    resourceTypeDescription: "",
    resourceMemberList: [],
    active: 0,
    createdDateTime: "",
    modifiedDateTime: ""
};