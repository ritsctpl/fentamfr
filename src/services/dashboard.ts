import api from "./api";

export const apiDashboard = async (url: string, body: any, headers:any) => {
    const response = await api.post(url, body, {
        headers: headers
    });
    return response.data;
};

export const commonApi = async (url: string, body: any) => {
    const response = await api.post(url, body);
    return response.data;
};

