import api from "./api";

// Define interface for the response structure
export interface TemplateBuilderResponse {
  templateBuilder?: {
    handle: string;
    site: string;
    templateLabel: string;
    templateType: string;
    templateVersion: string;
    currentVersion: boolean;
    groupIds: GroupList[];
    userId: string;
    active: number;
    createdDateTime: string;
    updatedDateTime: string;
  };
  message_details?: {
    msg: string;
    msg_type: string;
  };
  // For array responses
  map?: (callbackFn: (item: any) => any) => any[];
}

export interface GroupList {
  handle: string;
  type: string;
  label: string;
}

export const fetchTemplateBuilderData = async (
  request: object,
  service: string,
  endpoint: string
): Promise<TemplateBuilderResponse> => {
  try {
    const response = await api.post(`/${service}/${endpoint}`, request);
    console.log(response, "responseTemplateBuilder");
    // Return the raw response data
    return response.data.data || response.data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}; 