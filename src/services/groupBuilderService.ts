import api from "./api";

export const createGroup = async (group: any) => {
    const response = await api.post('/groupbuilder-service/createGroup', group);
    return response.data;
};

export const getTop50Groups = async () => {
    const response = await api.post('/groupbuilder-service/getTop50', {site:'1004'});
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

export const getSections = async () => {
    const response = await api.post(`/sectionbuilder-service/getAllSection`, {site:'1004'});
    return response.data;
};
