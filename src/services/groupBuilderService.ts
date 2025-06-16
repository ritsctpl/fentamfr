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
