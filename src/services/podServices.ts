import { message } from 'antd';
import api from './api';
import { parseCookies } from 'nookies';
import { useContext } from 'react';
import { log } from 'console';


const cookies = parseCookies();
const userId = cookies.rl_user_id
const site = cookies.site;


export const fetchPodTop50 = async (site: string, podName) => {
  const response = await api.post('/pod-service/retrieve', { site, podName });
  console.log(response, 'responsessss');

  return response.data;
};

export const retrieveListOfPcuBO = async (site: string, operation) => {
  const response = await api.post('/pcuinqueue-service/retrieveListOfPcuBO', { site, ...operation });
  return response.data;
};

export const batchRecipeByFilters = async (site: string, operation) => {
  const response = await api.post('/batchnoinqueue-service/getInQueueForBatchRecipeByFilters', { site, ...operation });
  return response.data;
};
export const fetchComponentList = async (params) => {
  const response = await api.post('/bomheader-service/getComponentList/', params);
  return response.data.bomComponentList;
};

export const fetchLogToolList = async (site, params) => {
  const response = await api.post('/toolgroup-service/retrieveByAttachment/', { site, ...params });
  console.log(response, 'response.data');
  return response.data;
};


export const fetchShopOrderPod = async (params) => {
  const response = await api.post('/shoporder-service/retrieve/', params);
  return response.data;
};

export const fetchBatchTop50 = async (site: string, worklist) => {
  const response = await api.post('/batchnoinwork-service/getRecordUsingFilters/', { site, ...worklist });
  if (response?.data) {
    sessionStorage.setItem('batchTop50Data', JSON.stringify(response));
  }

  console.log(response.data, 'responseworklist');
  return response;
};

export const fetchPcuTop50 = async (site: string, worklist) => {
  const response = await api.post('/worklist-service/getWorkList/', { site, ...worklist });

  console.log(response, 'responseworklist');
  return response.data;
};


export const fetchStart = async (url: string, params: object, buttonId: string,filterFormData, phaseByDefault) => {
  let Pcuinqueue;
  console.log(url, 'params');
  let selectedRowCurrentData;

  // Check if running in a browser environment
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const sessionData = sessionStorage.getItem('selectedRowCurrentData');
      if (sessionData) {
        selectedRowCurrentData = JSON.parse(sessionData);
        params = { ...params, ...selectedRowCurrentData };
      }
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
  }

  if (url === "start-service/start") {
    Pcuinqueue = await api.post('/pcuinqueue-service/retrieve', params);
    if(Pcuinqueue?.data?.errorCode){
       return Pcuinqueue.data
    }
    else{
      Pcuinqueue = {
        requestList: [ {...Pcuinqueue.data,quantity: filterFormData?.qtty || Pcuinqueue.data.qtyInQueue, qtyCompleted:"0"} ]
      }
    }
    
  }
  else if (url === "signoff-service/signoff") {

    Pcuinqueue = await api.post('/start-service/retrieve', params);
    if(Pcuinqueue.data.errorCode){

    }
    else{
      Pcuinqueue = {
        requestList: [ {...Pcuinqueue.data,quantity: filterFormData?.qtty || Pcuinqueue.data.qtyInQueue, qtyCompleted:"0"} ]
      }
    }
  }
  else if (url === "pcucomplete-service/complete") {
    Pcuinqueue = await api.post('/start-service/retrieve', params);
    if(Pcuinqueue.data.errorCode){

    }
    else{
      Pcuinqueue = {
        requestList: [ {...Pcuinqueue.data,quantity: filterFormData?.qtty || Pcuinqueue.data.qtyInQueue ,qtyCompleted:"0"} ]
      }
    }
  }

  else if (url === "processorderstate-service/signoff") {

    const request = {
      site: site,
      batchNumber: selectedRowCurrentData?.[0]?.batchNo,
      orderNo: selectedRowCurrentData?.[0]?.orderNumber,
    }
    const fetchBatchNum = await retrieveBatchNumberHeader(request);

    Pcuinqueue = {
      "signoffBatches": selectedRowCurrentData.map(row => ({
        "site": site,
        ...{
          ...row,
          phaseId: filterFormData.defaultPhaseId || phaseByDefault || '',
          user: userId,
          batchNumber: row.batchNo,
          phase: filterFormData.defaultPhaseId || phaseByDefault || '',
          operation: filterFormData.defaultOperation || '',
          resource: sessionStorage.getItem('ResourceId') || filterFormData.defaultResource || '',
          quantity: sessionStorage.getItem('quantity') || row.quantity || null,
          material: fetchBatchNum?.response?.material || '',
          materialVersion: fetchBatchNum?.response?.materialVersion || '',
          recipe: fetchBatchNum?.response?.recipeName,
          recipeVersion: fetchBatchNum?.response?.recipeVersion,
          qty: sessionStorage.getItem('quantity') || row.quantity || null,
          reasonCode: filterFormData?.reasonCode
        }
      })),
      "sync": true
    }

  }
  else if (url === "processorderstate-service/start") {
    // const request = {
    //   site: site,
    //   batchNumber: selectedRowCurrentData?.[0]?.batchNo,
    //   orderNo: selectedRowCurrentData?.[0]?.orderNumber,
    // }
    // const fetchBatchNum = await retrieveBatchNumberHeader(request);
    // debugger
    // Pcuinqueue = {
    //   "startBatches": [
    //     {
    //       "site": site,
    //       ...{ ...selectedRowCurrentData[0], phaseId: filterFormData.defaultPhaseId || phaseByDefault || '',
    //          batchNumber: selectedRowCurrentData[0].batchNo, user: userId, phase: filterFormData.defaultPhaseId || phaseByDefault || '',
    //           operation: filterFormData.defaultOperation || '', resource: sessionStorage.getItem('ResourceId') ||  filterFormData.defaultResource || '',
    //            quantity: sessionStorage.getItem('quantity') ||  selectedRowCurrentData[0].quantity || null,
    //            material: fetchBatchNum?.response?.material || '', materialVersion: fetchBatchNum?.response?.materialVersion || '',
    //            recipe: fetchBatchNum?.response?.recipeName,recipeVersion: fetchBatchNum?.response?.recipeVersion,
    //            qty: sessionStorage.getItem('quantity') ||  selectedRowCurrentData?.[0]?.quantity || null}
    //     }
    //   ],
    //   "sync": true
    // }


    const fetchBatchNumPromises = selectedRowCurrentData.map(async (row) => {
      const request = {
          site: site,
          batchNumber: row?.batchNo,
          orderNo: row?.orderNumber,
      };
      // Fetch the batch number header for the current row
      return await retrieveBatchNumberHeader(request);
  });
  
  // Wait for all batch number fetch promises to resolve
  const fetchBatchNumResults = await Promise.all(fetchBatchNumPromises);
  debugger
  // Construct the Pcuinqueue object
  Pcuinqueue = {
      "startBatches": selectedRowCurrentData.map((row, index) => ({
          "site": site,
          "batchNumber": row?.batchNo,
          "phase": filterFormData?.defaultPhaseId || phaseByDefault || '',
          "operation": filterFormData?.defaultOperation || '',
          "resource": sessionStorage.getItem('ResourceId') || filterFormData?.defaultResource || '',
          "user": userId,
          "orderNumber": row?.orderNumber,
          "material": fetchBatchNumResults[index]?.response?.material || '',
          "materialVersion": fetchBatchNumResults[index]?.response?.materialVersion || '',
          "recipe": fetchBatchNumResults[index]?.response?.recipeName,
          "recipeVersion": fetchBatchNumResults[index]?.response?.recipeVersion,
          "qty": row?.qty || row?.quantity,
          "quantity": row?.qty || row?.quantity,

      })),
      "sync": true
  };

  }
  else if (url === "processorderstate-service/complete") {

    const request = {
      site: site,
      batchNumber: selectedRowCurrentData?.[0]?.batchNo,
      orderNo: selectedRowCurrentData?.[0]?.orderNumber,
    }
    const fetchBatchNum = await retrieveBatchNumberHeader(request);

    Pcuinqueue = {
      "completeBatches": [
        {
          "site": site,
          ...{ ...selectedRowCurrentData[0], phaseId: filterFormData.defaultPhaseId || phaseByDefault || '',
             batchNumber: selectedRowCurrentData[0].pcu, phase: filterFormData.defaultPhaseId || phaseByDefault || '',
              operation: filterFormData.defaultOperation || '', resource: sessionStorage.getItem('ResourceId') ||  filterFormData.defaultResource || '',
               quantity: selectedRowCurrentData[0].quantity || null, ...params, 
               material: fetchBatchNum?.response?.material || '', materialVersion: fetchBatchNum?.response?.materialVersion || '',
               recipe: fetchBatchNum?.response?.recipeName,recipeVersion: fetchBatchNum?.response?.recipeVersion,
               qty: sessionStorage.getItem('quantity') ||  selectedRowCurrentData?.[0]?.quantity || null}
        }
      ],
      "sync": true
    }

  }
  else if (url === "batchnohold-service/hold") {
    console.log(params, "batchnohold-service/hold");
    Pcuinqueue = {
          "site": site,
          ...{ ...selectedRowCurrentData[0], phaseId: filterFormData.defaultPhaseId || phaseByDefault || '', batchNumber: selectedRowCurrentData[0].pcu, phase: filterFormData.defaultPhaseId || phaseByDefault || '', operation: filterFormData.defaultOperation || '', resource: sessionStorage.getItem('ResourceId') ||  filterFormData.defaultResource || '', quantity: selectedRowCurrentData[0].quantity || null, ...params }
        }
      
  }
  else if (url === "batchnohold-service/unhold") {
    console.log(params, "batchnohold-service/unhold");
    Pcuinqueue = {
          "site": site,
          ...{ ...selectedRowCurrentData[0], phaseId: filterFormData.defaultPhaseId || phaseByDefault || '', batchNumber: selectedRowCurrentData[0].pcu, phase: filterFormData.defaultPhaseId || phaseByDefault || '', operation: filterFormData.defaultOperation || '', resource: sessionStorage.getItem('ResourceId') ||  filterFormData.defaultResource || '', quantity: selectedRowCurrentData[0].quantity || null, ...params }
        }
  }
  console.log("start");

  // if(Pcuinqueue.data.errorCode) {
  //   console.log(Pcuinqueue,"errorCode");

  //   return Pcuinqueue.data
  // }

  const startResquest = {
    requestList: [{ ...Pcuinqueue, quantity: "0", qtyCompleted: "0" }]
  }


  console.log("Service API request", Pcuinqueue);

  try {
    const response = await api.post(url, Pcuinqueue);
    // message.success(response?.data?.message_details?.msg || response?.data?.message || "Operation successful");
    console.log("Service API response", response);
 
    if (url === "processorderstate-service/start"){
    if (response?.data?.status !== 'failure') {
      message.destroy();
      // message.success(response?.data?.processedStartBatches[0]?.message);
      // console.log(response?.data?.message, 'responseStart');
    }
    else {
      message.destroy();
      // message.error(response?.data?.processedStartBatches[0]?.message);
    }
  }
 else {
    if (!response?.data?.errorCode) {
      message.destroy();
      // message.success(response?.data?.message_details?.msg);
      // console.log(response?.data?.message, 'responseStart');
    }
    else {
      message.destroy();
      // message.error(response?.data?.message);
    }
  }
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error if necessary
  }
};

export const completeBatch = async (req: any,) => {
  const response = await api.post('/processorderstate-service/complete', { ...req });
  return response.data;
};

export const completePcu = async (req: any,) => {
  const response = await api.post('/pcucomplete-service/complete', { ...req });
  return response.data;
};


export const updateSite = async (userId: string, userData: Object) => {
  try {
    const response = await api.post('/site-service/update', { // Include site here
      userId, // Include userId here
      ...userData, // Include all other fields from siteData
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;

  } catch (error) {
    throw error; // Re-throw error or handle it according to your needs
  }
};

export const addSite = async (userId: string, userData: Object) => {
  try {
    const response = await api.post('/site-service/create', { userId, ...userData }, {
      headers: {
        'Content-Type': 'application/json',
        // Add other headers if needed, e.g., Authorization tokens
      },
    });
    return response.data;

  } catch (error) {
    throw error; // Re-throw error or handle it according to your needs
  }
};
export const deleteSite = async (userId: string, site: string) => {
  try {
    const response = await api.post('/site-service/delete', { userId, site }, {
      headers: {
        'Content-Type': 'application/json',
        // Add other headers if needed, e.g., Authorization tokens
      },
    });
    return response.data;

  } catch (error) {
    throw error; // Re-throw error or handle it according to your needs
  }
};

export const RetriveResourcePod = async (site: string, resource) => {
  const response = await api.post('/resource-service/retrieveByResource', { site, resource });
  return response.data;
};

export const RetrivePcuu = async (site: string, productionLog) => {
  const response = await api.post('/productionlog-service/retrieve', { site, ...productionLog });
  return response.data;
};
export const RetriveDcGroup = async (site: string, dcGroup) => {
  console.log(dcGroup, "dcGroup");
  const response = await api.post('/dccollect-service/retrieve', { site, ...dcGroup });
  console.log(response, "responseDC");
  return response.data;
};


export const retrieveOperation = async (request: any) => {
  const response = await api.post('/operation-service/retrieve', { ...request });
  return response.data;
};


export const retrieveActivity = async (site: string, activityId: string)   => {
  const response = await api.post('/activity-service/retrieve', { site, activityId });
  // console.log(response, 'retrieve activity response');
  return response.data;
};

  export const retrieveLogs = async (site: string, productionLog) => {
    const response = await api.post('/productionlog-service/retrieveByType', { site, ...productionLog });
    return response.data;
  };

  export const retrieveBatchNumber = async (payload: any) => {
    const response = await api.post('/batchnoheader-service/retrieveOnlyBatchNumberList', { ...payload });
    return response.data;
  };

  
  // export const retrieveBatchNumbers = async (payload: any) => {
  //   const response = await api.post('/batchnoheader-service/retrieveBatchNoList', { ...payload });
  //   return response.data;
  // };


  export const retrieveBatchNumberHeader = async (request: any) => {
    const response = await api.post('/batchnoheader-service/retrieve', { ...request });
    return response.data;
  };

  export const retrieveBatchStepStatus = async (request: any) => {
    try {
      const response = await api.post('batchstepstatus-service/getStepStatus', { ...request });
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
export const retrieveResourceStatus = async (request: any) => {
  const response = await api.post('resource-service/retrieveByResource', { ...request });
  return response.data;
};

export const retrieveBreakStatus = async (request: any) => {
  const response = await api.post('downtime-service/checkBreakStatus', {...request });
  return response.data;
};

