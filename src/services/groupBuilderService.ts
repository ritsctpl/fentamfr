import api from "./api";

export const createGroup = async (group: any) => {
    const response = await api.post('/groupbuilder-service/createGroup', group);
    return response.data;
};

export const getTop50Groups = async (searchParams: any) => {
    const response = await api.post('/groupbuilder-service/getAllGroup', searchParams);
    return response.data;
};

export const updateGroup = async (group: any) => {
    const response = await api.post(`/groupbuilder-service/updateGroup`, group);
    return response.data;
};

export const deleteGroup = async (group: any) => {
    const response = await api.post(`/groupbuilder-service/deleteGroup`, group);
    return response.data;
};

export const getSections = async (searchParams: any) => {
    const response = await api.post(`/sectionbuilder-service/getAllSection`, searchParams);
    return response.data;
};

export const getGroupPreview = async (group: any) => {
    const response = await api.post(`/groupbuilder-service/previewGroup`, group);
    return response.data;
};

export const getTop50Components = async (searchParams: any) => {
    const response = await api.post(`/docbuilder-service/components/retrieveTop50`, searchParams);
    return response.data;
};

export const getComponentById = async (id: any,dataType: string) => {        
    const response = await api.post(`/docbuilder-service/components/${dataType}/fetch`, id);
    return response.data;
};

export const createComponent = async (dataType: string, component: any) => {
    const response = await api.post(`/docbuilder-service/components/${dataType}/create`, component);
    return response.data;
};

export const updateComponent = async (component: any) => {
    const response = await api.post(`/componentbuilder-service/updateComponent`, component);
    return response.data;
};

export const deleteComponent = async (component: any) => {
    const response = await api.post(`/componentbuilder-service/deleteComponent`, component);
    return response.data;
};