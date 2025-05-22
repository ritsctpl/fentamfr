import api from "./api";

// Define interface for the response structure
export interface SectionBuilderResponse {
  sectionBuilder?: {
    handle: string;
    site: string;
    sectionLabel: string;
    instructions?: string;
    effectiveDateTime: string;
    componentIds?: string[];
    userId: string;
    active: number;
    createdDateTime: string;
    modifiedDateTime: string;
    createdBy: string;
    modifiedBy: string;
  };
  message_details?: {
    msg: string;
    msg_type: string;
  };
  // New component response format
  map?: (callbackFn: (item: any) => any) => any[];
}

export const fetchSectionBuilderData = async (
  request: object,
  service: string,
  endpoint: string
): Promise<SectionBuilderResponse> => {
  try {
    const response = await api.post(`/${service}/${endpoint}`, request);
    console.log(response, "responseSectionBuilder");
    // Return the raw response data
    return response.data.data || response.data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
