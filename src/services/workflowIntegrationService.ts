import api from './api';

export const fetchWorkflowIntegration = async (payload: object) => {
    const response = await api.post('/integration-service/getAllIntegrationSummary', payload);
    return response.data;
};

export const fetchAllWorkflowIntegration = async (payload: object) => {
    const response = await api.post('/integration-service/getAllIntegrationSummary', payload);
    return response.data;
};

export const CreateWorkflowIntegration = async (payload: object) => {
    const response = await api.post('/integration-service/createIntegrationFlow',  payload );
    return response.data;
};

export const UpdateWorkflowIntegration = async (payload: object) => {
    const response = await api.post('/integration-service/createIntegrationFlow',  payload );
    return response.data;
};

export const RetriveWorkflowIntegrationSelectedRow = async (payload: { site: any, identifier: any }) => {
    const response = await api.get(`/integration-service/identifier/${payload.site}/${payload.identifier}`);
    return response.data;
};

export const createCopyWorkflowIntegration = async (payload: Object) => {
    const response = await api.post('/integration-service/createIntegrationFlow',  payload );
    return response.data;
};

export const deleteWorkflowIntegration = async (payload: { site: any, id: any }) => {
    const response = await api.delete(`integration-service/${payload.site}/${payload.id}`);
    return response.data;
};


export const getPreProcessJolt = async (payload: { site: any, type: any }) => {
    const response = await api.get(`/integration-service/jolt-spec/byType/specNames/${payload.site}/${payload.type}`);
    return response.data;
};

export const getPostProcessXSLT = async (payload: { site: any, type: any }) => {
    const response = await api.get(`integration-service/jolt-spec/byType/specNames/${payload.site}/${payload.type}`);
    return response.data;
};      

export const getProcessTransformation = async (payload: { site: any, type: any }) => {
    const response = await api.get(`/integration-service/jolt-spec/byType/specNames/${payload.site}/${payload.type}`);
    return response.data;
};

export const getPostProcessJolt = async (payload: { site: any, type: any }) => {
    const response = await api.get(`/integration-service/jolt-spec/byType/specNames/${payload.site}/${payload.type}`);
    return response.data;
};
