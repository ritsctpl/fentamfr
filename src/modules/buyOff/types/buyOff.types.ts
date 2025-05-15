export interface BuyOffData {
    id: string;
    site: string;
    buyOff: string;
    version: string;
    description: string;
    status: string;
    messageType: string;
    partialAllowed: boolean;
    rejectAllowed: boolean;
    skipAllowed: boolean;
    currentVersion: boolean;
    createdDateTime: string;
    modifiedDateTime: string;
    userGroupList: any[];
    attachmentList: any[];
    customDataList: any[];
} 