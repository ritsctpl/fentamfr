export interface ActivityGroupMember {
    activityId?: string;
}

export interface NcCodeRequest {
    ncCode?: string;
    description?: string;
    status?: string;
    assignNCtoComponent?: string;
    ncCategory?: string;
    dpmoCategory?: string;
    ncDatatype?: string;
    collectRequiredNCDataonNC?: string;
    messageType?: string;
    ncPriority?: string;
    maximumNCLimit?: string;
    ncSeverity?: string;
    secondaryCodeSpecialInstruction?: string;
    canBePrimaryCode?: boolean;
    closureRequired?: boolean;
    autoClosePrimaryNC?: boolean;
    autoCloseIncident?: boolean;
    secondaryRequiredForClosure?: boolean;
    erpQNCode?: boolean;
    erpCatalog?: string;
    erpCodeGroup?: string;
    erpCode?: string;
    oeeQualityKPIRelevant?: boolean;
    dispositionRoutingsList?: any[];
    operationGroupsList?: any[];
    ncGroupsList?: any[];
    secondariesGroupsList?: any[];
    activityHookList?: any[];
    customDataList?: any[];
}

export const defaultNcCodeRequest: NcCodeRequest = {
    ncCode: '',
    description: '',
    status: 'Enabled',
    assignNCtoComponent: 'Stay',
    ncCategory: 'Failure',
    dpmoCategory: 'None',
    ncDatatype: '',
    collectRequiredNCDataonNC: 'Open',
    messageType: '',
    ncPriority: '',
    maximumNCLimit: '',
    ncSeverity: 'None',
    secondaryCodeSpecialInstruction: '',
    canBePrimaryCode: false,
    closureRequired: false,
    autoClosePrimaryNC: false,
    autoCloseIncident: false,
    secondaryRequiredForClosure: false,
    erpQNCode: false,
    erpCatalog: '',
    erpCodeGroup: '',
    erpCode: '',
    oeeQualityKPIRelevant: false,
    dispositionRoutingsList: [],
    operationGroupsList: [],
    ncGroupsList: [],
    secondariesGroupsList: [],
    activityHookList: [],
    customDataList: [],
};
