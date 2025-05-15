import api from './api';

export const fetchProcessTop50= async (site: string) => {
  const response = await api.post('/processorder-service/retrieveTop50', {site} );
  console.log(response, 'sssssss');
  return response.data.processOrderResponseList;
};

export const fetchProcessOrderTop50= async (site: string) => {
  const response = await api.post('/processorder-service/getAllProessOrders', {site} );
  return response?.data?.processOrderResponseList;
};

export const fetchAllProcessOrderList= async (site: string, orderNumber: string) => {
  const response = await api.post('/processorder-service/getAllProessOrders', {site, orderNumber} );
  return response?.data;
};

export const fetchProcessAllData= async (site: string, orderNumber: string) => {
  const response = await api.post('/processorder-service/retrieveAll', { site, orderNumber });
  return response.data;
};

export const fetchProcessReleaseAllData= async (site: string) => {
  const response = await api.post('/processorder-service/retrieveAll', { site });
  return response.data.processOrderResponseList;
};

export const fetchCertification= async (site: string, userId: string, url: string) => {
      const response = await api.post(`/${url}`, { site});
  return response.data.certificationList;
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  return response.data;
};

export const fetchProcessAll= async (site: string, orderNumber: string) => {
    const response = await api.post('/processorder-service/retrieve', {site, orderNumber});
    console.log(response, 'responseAll');
    return response.data;
  };

  export const fetchProcessReleaseAll= async (site: string, payload) => {
    const response = await api.post('/processorder-service/retrieve', { site, ...payload});
    return response.data;
  };

  export const fetchUserGroup= async (site: string, user) => {
    const settingUser = user ===""? await api.post('/user-service/availableUserGroup/', { site}) : await api.post('/user-service/availableUserGroup/', { site,user});
    const response = settingUser;
    return response.data;
  };

  export const fetchUserWorkCenter= async (site: string, user) => {
    const response = await api.post('/user-service/availableWorkCenter/', { site,user});
    return response.data;
  };
  export const getSiteRetrieveTop50= async () => {
    const response = await api.post('/site-service/retrieveTop50/');
    return response.data;
  };
  
  export const updateProcess = async (site: string, userId: string, payload: Object) => {
    try {
      const response = await api.post('/processorder-service/update', {
        site, 
        userId,
        ...payload,
      });
      console.log(response,'resopnse');
      
      return response.data;
  
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };
  
  export const addProcess = async (site: string, userId: string, payload: Object) => {
    try {
      const response = await api.post('/processorder-service/create', {site,userId,...payload});
      console.log(response);
      
      return response.data;
  
    } catch (error) {
      console.error('Error Creating Process Order:', error);
    }
  };
  
  export const deleteProcess = async (site: string, userId: string, orderNumber: string) => {
    try {
      const response = await api.post('/processorder-service/delete', {site,userId,orderNumber});
      return response.data;
    } catch (error) {
      throw error; 
    }
  };
  export const copyAllUser = async (site: string, userId: string, userData: Object) => {
    try {
      const response = await api.post('/user-service/create', {site,userId,...userData});
      return response.data;
    } catch (error) {
      console.error('Error Copying User:', error);
    }
  };

  // export const ProcessOrderReleaseData= async (site: string, payload:object) => {
  //   const payloads = {
  //     releaseRequest: [{
  //       ...payload,
  //       site,
  //     }]
  //   }
  //   const response = await api.post('/shoporderrelease-service/release', {site, ...payloads});
  //   return response.data;
  // };


  export const ProcessOrderReleaseData = async (site: string, payload: object) => {
    console.log(payload, 'payload');
    
    const response = await api.post('/processorderrelease-service/release', payload);
    return response.data.batches;
  };

  export const fetchAllRecipe = async (site: string, payload: object) => {
    const response = await api.post('/recipe-service/retrieveAll', {site, ...payload});
    return response.data;
  };

  export const fetchTop50Recipe = async (site: string) => {
    const response = await api.post('/recipe-service/retrieveTop50', { site });
    return response.data;
  };
  

  export const fetchAllProcessOrder= async (site: string, orderNumber: string) => {
    const response = await api.post('/processorder-service/getAllProessOrders', { site, orderNumber });
    return response.data;
  };

  export const retrieveActivity = async ( activityId: string)   => {
    const response = await api.post('/activity-service/retrieve', {  activityId });
    return response.data
  };