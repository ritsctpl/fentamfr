
import api from './api';

export const fetchAllUserGroup= async (site: string) => {
  const response = await api.post('/usergroup-service/retrieveAll', { site });
  return response?.data?.userGroupResponses;
};

export const retrieveUserGroup= async (site: string, userGroup: string) => {
  const response = await api.post('/usergroup-service/retrieve', { site, userGroup });
  return response?.data;
};

export const retrieveTop50ItemGroup = async (site: string) => {
  const response = await api.post('/itemgroup-service/retrieveTop50', { site });
  return response.data?.groupNameList;
};
