import api from './api';

export const fetchWorkflowResponseAll = async (site: string) => {
    const response = await api.get('/integration-service/workflowresponses/getall', {
        params: {
            site: site
        }
    });
    return response.data;
};

// export const fetchWorkflowResponseTop50 = async (site: string) => {
//     const response = await api.post('/integration-service/workflowresponses/gettop50', {site: site});
//     return response.data;
// }

export const fetchWorkflowResponseTop50 = async (site: string) => {
    const response = await api.get(`/integration-service/workflowresponses/gettop50/${site}`);
    return response.data;
}

export const byIdentifier = async (identifier: string, value: string) => {
    const response = await api.get(`/integration-service/workflowresponses/byIdentifier/${identifier}`);
    return response.data;
}

export const fetchWorkflowResponseByDateRange = async (startDate: string, endDate: string) => {
    try {
        const response = await api.get('/integration-service/workflowresponses/byDateRange', {
            params: {
                startDate: `${startDate}T00:00:00`,
                endDate: `${endDate}T23:59:59`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const byStatus = async (status: string) => {
    let sample;
    if (status === "Pass") {
      sample = "Pass";
    } else if (status === "Fail") {
      sample = "Fail"; 
    } else {
      sample = "Pending";
    }
    const response = await api.get(`/integration-service/workflowresponses/byStatus/${sample}`);
    return response.data;
}

export const fetchFilteredWorkflowResponses = async (
    identifier: string,
    status: string, 
    startDate: string,
    endDate: string
) => {
    try {
        // Only include params that have values
        const params: Record<string, string> = {};
        
        if (identifier) params.identifier = identifier;
        if (status) params.status = status;
        if (startDate) params.startDate = `${startDate}T00:00:00`;
        if (endDate) params.endDate = `${endDate}T23:59:59`;

        const response = await api.get('/integration-service/workflowresponses/filter', {
            params
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchWorkflowFilterResponse = async (payload: any) => {
    const response = await api.post('integration-service/workflowresponses/combinationFilter', payload);
    return response.data;
}
