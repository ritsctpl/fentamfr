import api from "./api";

export const createTemplate = async (template: any) => {
    const response = await api.post('/templatebuilder-service/createTemplate', template);
    console.log(response, 'ddd');
    
    return response.data;
};

export const getAllTemplates = async (payload) => {
    const response = await api.post('/templatebuilder-service/getAllTemplate', payload);
    return response.data;
};

export const getTop50Templates = async (site: string) => {
    const response = await api.post('/templatebuilder-service/getTop50Template', {site});
    return response.data;
};

export const retrieveTemplates = async (template: any) => {
    const response = await api.post('/templatebuilder-service/getTemplate', template);
    console.log(response, 'retrieveTemplates');
    
    return response.data;
};

export const updateTemplate = async (template: any) => {
    const response = await api.post(`/templatebuilder-service/updateTemplate`, template);
    return response.data;
};

export const deleteTemplate = async (template: any) => {
    const response = await api.post(`/templatebuilder-service/deleteTemplate`, template);
    return response.data;
};

export const getComponents = async () => {
    const response = await api.post(`/componentbuilder-service/getAllComponent`, {site:'1004', componentLabel: ''});
    return response.data;
};

export const getSections = async () => {
    const response = await api.post(`/sectionbuilder-service/getAllSection`, {site:'1004', sectionLabel: ''});
    return response.data;
};

export const getGroups = async () => {
    const response = await api.post(`/groupbuilder-service/getAllGroup`, {site:'1004', groupLabel: ''});
    return response.data;
};

export const getTemplatePreview = async (payload: any) => {
    const response = await api.post(`/templatebuilder-service/preview`, payload);
    return response.data;
};
