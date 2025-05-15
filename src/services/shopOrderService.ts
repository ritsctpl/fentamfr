
import api from './api';

export const fetchShopTop50= async (site: string) => {
  const response = await api.post('/shoporder-service/retrieveTop50/', { site });
  return response.data.shopOrderResponseList;
};
export const fetchShopAllData= async (site: string) => {
  const response = await api.post('/shoporder-service/retrieveAll/', { site });
  return response.data.shopOrderResponseList;
};

export const fetchCertification= async (site: string, userId: string, url: string) => {
      const response = await api.post(`/${url}`, { site});
  return response.data.certificationList;
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  return response.data;
};

export const fetchShopAll= async (site: string, shopOrder) => {
    const response = await api.post('/shoporder-service/retrieve', { site, shopOrder}); 
    return response.data;
  }; 

  export const fetchShopReleaseAll= async (site: string, shopOrder) => {
    const response = await api.post('/shoporder-service/retrieve', { site, ...shopOrder});
    return response.data;
  };

  export const fetchUserGroup= async (site: string, user) => {
    const settingUser = user ===""? await api.post('/user-service/availableUserGroup/', { site}) : await api.post('/user-service/availableUserGroup/', { site,user});
    const response = settingUser;
    return response.data;
  };

  export const fetchUserWorkCenter= async (site: string, user) => {
    const response = await api.post('/user-service/availableWorkCenter/', { site,user});
    console.log(response +'Response')
    return response.data;
  };
  export const getSiteRetrieveTop50= async () => {
    const response = await api.post('/site-service/retrieveTop50/');
    console.log(response +'Sites')
    return response.data;
  };
  
  export const updateShop = async (site: string, userId: string, shopData: Object) => {
    try {
      console.log("Enter Update");
      const response = await api.post('/shoporder-service/update', {
        site, // Include site here
        userId, // Include userId here
        ...shopData, // Include all other fields from shiftData
      }, {
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
      console.error('Error updating shop:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  
  export const addShop = async (site: string, userId: string, shopData: Object) => {
    try {
      console.log({site,userId,...shopData});
      const response = await api.post('/shoporder-service/create', {site,userId,...shopData}, {
        headers: {
          'Content-Type': 'application/json',
          // Add other headers if needed, e.g., Authorization tokens
        },
      });
      // Return the response data
      console.log(response ,"add shoporder");
      return response.data;
  
    } catch (error) {
      // Handle error
      console.error('Error updating shift:', error);
      throw error; // Re-throw error or handle it according to your needs
    }
  };
  
  
  // In @services/shiftService.js
  export const deleteShop = async (site: string, userId: string,shopOrder: string) => {
    try {
      const response = await api.post('/shoporder-service/delete', {site,userId,shopOrder});
      return response.data;
    } catch (error) {
      throw error; 
    }
  };
  export const copyAllUser = async (site: string, userId: string, userData: Object) => {
    try {
      console.log({site,userId,...userData});
      const response = await api.post('/user-service/create', {site,userId,...userData}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error; 
    }
  };

  export const ShopOrderReleaseData= async (site: string, payload:object) => {
    const payloads = {
      releaseRequest: [{
        ...payload,
        site,
      }]
    }
    const response = await api.post('/shoporderrelease-service/release', {site, ...payloads});
    return response.data;
  };
  
 