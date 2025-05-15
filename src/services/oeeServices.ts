import api from './api';

// Request cache to prevent duplicate calls
const apiCache = new Map<string, Promise<any>>();

// Request cleanup timeout (clear cache after 2 seconds)
const CACHE_TIMEOUT = 100;

// Helper function to create cached API calls
function createCachedApiCall(fn: Function, cacheKey: string) {
  return (...args: any[]) => {
    // Create a unique cache key based on function name and args
    const uniqueKey = `${cacheKey}_${JSON.stringify(args)}`;
    
    // If we already have this request in flight, return the cached promise
    if (apiCache.has(uniqueKey)) {
      // console.log(`[API Cache] Using cached request for ${uniqueKey}`);
      return apiCache.get(uniqueKey);
    }
    
    // Otherwise make the request and cache the promise
    // console.log(`[API Cache] Making new request for ${uniqueKey}`);
    const request = fn(...args);
    apiCache.set(uniqueKey, request);
    
    // Remove from cache after request is complete
    request.finally(() => {
      setTimeout(() => {
        apiCache.delete(uniqueKey);
      }, CACHE_TIMEOUT);
    });
    
    return request;
  };
}

export const fetchOee = async (site: string) => {
  const response = await api.post('/shift-service/retrieveAll', { site });
  return response.data.shiftResponseList
};
export const fetchWorkCenter = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site });
  return response.data.workCenterList
};

export const fetchBatch = async (site: string) => {
  const response = await api.post('/batchnoheader-service/retrieveBatchNoList', { site });
  return response.data.batchNos
};


export const fetchResource = async (site: string) => {
  const response = await api.post('/resource-service/retrieveResourceList', { site });
  return response.data
};

export const getLiveOee = async (request: object) => {
  const response = await api.post('/oee-service/liveoee', request);
  return response.data
};

export const getOverallOEE = async (request: object, endpoint: string) => {
  const response = await api.post(`/oee-service/${endpoint}`, request);
  return response.data
};

export const getQualityOEE = async (request: object, endpoint: string) => {
  const response = await api.post(`/quality-service/${endpoint}`, request);
  // console.log(response,"oeeResponse");
  
  return response.data
};

export const getPerformanceOEE = async (request: object, endpoint: string) => {
  const response = await api.post(`/performance-service/${endpoint}`, request);
  return response.data
};

export const getDowntimeOEE = async (request: object, endpoint: string) => {
  const response = await api.post(`/downtime-service/${endpoint}`, request);
  return response.data
};

export const getAvailabilityOEE = async (request: object, endpoint: string) => {
  const response = await api.post(`/availability-service/${endpoint}`, request);
  return response.data
};

// export const getSampleData = async (endpoint: string) => {
//   const response = await fetch(`https://6747f7145801f515358ebaa9.mockapi.io/api/v1/${endpoint}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   }).then(response => response.json());
//   return response.data;
// };

export const getSampleData = async (endpoint: string, selectedValues: any) => {
  const response = await api.post(`/${endpoint}`, { site: 'RITS',...selectedValues });
  
  // Handle case where response.data is a single number
  if (typeof response.data === 'number') {
    return response.data === 0 ? 1 : response.data;
  }

  // Handle case where response.data is an array
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Handle case where response.data contains nested data
  if (response.data && typeof response.data === 'object') {
    // console.log(response.data,'response.data');
    // Look for first numeric value
    const values = Object.values(response.data);
    const numberValue = values.find(value => typeof value === 'number');
    if (numberValue !== undefined) {
      return numberValue === 0 ? '0' : numberValue;
    }

    // Look for first array value
    const arrayValue = values.find(value => Array.isArray(value));
    // console.log(arrayValue,'arrayValue');
    if (arrayValue) {
      return arrayValue;
    }
  }

  // Default return empty array if no valid data found
  return [];
};

export const getSampleData2 = async (controller: string, endpoint: string, site: string) => {
  const response = await api.post(`/${controller}/${endpoint}`, { site });
  return response.data
};

export const oeeTileDataFilter = async (request: object) => {
  const response = await api.post('/oee-service/OEEdetailsByFilter', request);
  return response.data
};
export const oeeTileData = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/OEEdetails', request);
      return response.data;
    } catch (error) {
      console.error('Error in oeeTileData:', error);
      return [];
    }
  },
  'oeeTileData'
);
export const getOeeDetailsByOperation = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailsByOperation', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByOperation:', error);
      return [];
    }
  },
  'getOeeDetailsByOperation'
);

export const getOeeDetailsByMachineDataResourceId = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailsByMachineDataResourceId', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByMachineDataResourceId:', error);
      return [];
    }
  },
  'getOeeDetailsByMachineDataResourceId'
);

export const getOeeDetailsByWorkCenterId = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailsByWorkCenterId', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByWorkCenterId:', error);
      return [];
    }
  },
  'getOeeDetailsByWorkCenterId'
);

export const getOeeDetailsByResourceId = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailsByResourceId', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByResourceId:', error);
      return [];
    }
  },
  'getOeeDetailsByResourceId'
);

export const getOeeDetailsByBatchNo = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/apiregistry/getOeeDetailsByBatchNumber', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByBatchNo:', error);
      return [];
    }
  },
  'getOeeDetailsByBatchNo'
);

export const getOeeDetailByShift = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailByShift', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailByShift:', error);
      return [];
    }
  },
  'getOeeDetailByShift'
);

export const getOeeDetailsByPlant = createCachedApiCall(
  async (request: any) => {
    // Original function implementation
    try {
      const response = await api.post('/oee-service/getOeeDetailsByPlant', request);
      return response.data;
    } catch (error) {
      console.error('Error in getOeeDetailsByPlant:', error);
      return [];
    }
  },
  'getOeeDetailsByPlant'
);

export const getOperatorReport = async (request: object) => {
  const response = await api.post('/oee-service/operatorReport', request);
  return response.data;
};

export const getApiRegistry = async (request: object, apipath: string) => {
  const response = await api.post(`/oee-service/apiregistry/${apipath}`, request);
  return response.data.data;
};
export const getcellGroups = async (site: string) => {
  const response = await api.post(`/oee-service/getOverallOeeReport`, { site });
  return response.data;
};

export const fetchAllWorkCenter = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  return response?.data?.workCenterList;
};

export const retrieveWorkCenter = createCachedApiCall(
  async (site: string, workCenter: string) => {
    // Original function implementation
    try {
      const response = await api.post('/workcenter-service/retrieve', { site, workCenter });
      return response?.data;
    } catch (error) {
      console.error('Error retrieving work center:', error);
      return null;
    }
  },
  'retrieveWorkCenter'
);

export const retrieveActivity = async (site: string, activityId: string)   => {
  const response = await api.post('/activity-service/retrieve', { site, activityId });
  return response?.data;
};

export const fetchAllReasonCode = async (site: string, reasonCode: string) => {
  const response = await api.post('/reasoncode-service/retrieveAll', { site, reasonCode });
  return response.data?.reasonCodeResponseList;
};

export const createPlannedDowntime = async (payload: any) => {
  const response = await api.post('/planneddowntime-service/create', { ...payload });
  return response.data;
};

export const updatePlannedDowntime = async (payload: any) => {
  const response = await api.post('/planneddowntime-service/update', { ...payload });
  return response.data;
};

export const getWorkcenterByCategory = async (payload: any) => {
  const response = await api.post('/workcenter-service/retrieveByWorkCenterCategory', { ...payload });
  return response.data?.workCenterList;
};

