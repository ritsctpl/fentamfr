export interface CustomDataRequest {
    handle?: string;
    site?: string;
    category?: string;
    customDataList?: CustomDataList[];
    userId?: string;
}

export interface CustomDataList {
    sequence?: string;
    customData?: string;
    fieldLabel?: string;
    required?: boolean;
}

export const defaultCustomDataRequest: Required<CustomDataRequest> = {
    handle: '',
    site: '',
    category: '',
    customDataList: [],
    userId: ''
};

