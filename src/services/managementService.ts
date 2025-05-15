import api from "./api";
import { ManagementData } from "@modules/oee_panel/hooks/configData";

export const createManagementData = async (data: ManagementData) => {
  const response = await api.post('/management-service/create', data);
  return response.data;
};

export const updateManagementData = async (data: ManagementData) => {
  const response = await api.post('/management-service/update', data);
  return response.data;
};

export const deleteManagementData = async (data: any) => {
  const response = await api.post(`/management-service/delete`, data);
  return response.data;
};

export const retrieveManagementData = async (site: string, dashBoardName?: string) => {
  const response = await api.post('/management-service/retrieve', {
    site,
    dashBoardName
  });
  return response.data.response;
};
export const retrieveAllManagementData = async (site: string) => {
  const response = await api.post('/management-service/retrieveAll', {
    site
  })
  return response.data.managementList;
};
