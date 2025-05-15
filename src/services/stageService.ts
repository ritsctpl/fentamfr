
import api from './api';

export const fetchStage= async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50/', { site });
  console.log(response.data +'Response')
  return response.data.operationList;
};
export const fetchStageAllData= async (site: string) => {
  const response = await api.post('/operation-service/retrieveBySite/', { site });
  console.log(response.data +'Response')
  return response.data.operationList;
};

export const fetchCertification= async (site: string, userId: string, url: string) => {
      const response = await api.post(`/${url}`, { site});
  console.log(response.data +'Response')
  return response.data.certificationList;
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  return response.data;
};
export const fetchStageAll= async (site: string, operation,revision) => {
    const response = await api.post('/operation-service/retrieve/', { site,operation,revision});
    console.log(response.data +'Response')
    return response.data;
  };
  
  // In @services/stageService.js
  export const updateStage = async (site: string, userId: string, stageData: Object) => {
    try {
      const response = await api.post('/operation-service/update', {
        site, // Include site here
        userId, // Include userId here
        ...stageData, // Include all other fields from stageData
      });
      // Return the response data
      console.log(response);
      return response.data;
  
    } catch (error) {
      // Handle error
      console.error('Error updating stage:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  
  export const addStage = async (site: string, userId: string, stageData: Object) => {
    try {
      console.log({site,userId,...stageData});
      const response = await api.post('/operation-service/create', {site,userId,...stageData});
      console.log(response);
      return response.data;
  
    } catch (error) {
      // Handle error
      console.error('Error updating stage:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  
  
  // In @services/stageService.js
  export const deleteStage = async (site: string, userId: string,data: Object) => {
    try {
      console.log(data);
      const response = await api.post('/operation-service/delete', {site,userId,...data}, {
        headers: {
          'Content-Type': 'application/json',
          // Add other headers if needed, e.g., Authorization tokens
        },
      });
      // Return the response data
      console.log(response);
      return response.data;
  
    } catch (error) {
      // Handle error
      console.error('Error deleting stage:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  export const copyAllStage = async (site: string, userId: string, operationData: Object) => {
    try {
      console.log({site,userId,...operationData});
      const response = await api.post('/operation-service/create', {site,userId,...operationData});
      // Return the response data
      console.log(response);
      return response.data;
  
    } catch (error) {
      // Handle error
      console.error('Error updating stage:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  
  