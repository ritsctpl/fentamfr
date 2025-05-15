import api from './api';
export const fetchEndpointsData = async (request: any,service, endpoint) => {
  const response = await api.post(`/${service}/${endpoint}`, request);
  console.log(response,"responseOee");
  
   return response.data
 };

 export const getPerformanceOEE = async (request: any,service, endpoint) => {
  const response = await api.post(`/${service}/${endpoint}`, request);
  console.log(response,"responseOee");
  
   return response.data
 };

 export const getQualityOEE = async (request: any,service, endpoint) => {
  const response = await api.post(`/${service}/${endpoint}`, request);
  console.log(response,"responseOee");
  
   return response.data
 };

 export const getAvailabilityOEE = async (request: any,service, endpoint) => {
  const response = await api.post(`/${service}/${endpoint}`, request);
  console.log(response,"responseOee");
  
   return response.data
 };
 export const getDownTimeOEE = async (request: any,service, endpoint) => {
  const response = await api.post(`/${service}/${endpoint}`, request);
  console.log(response,"responseOee");
  
   return response.data
 };

 
 



// // New service function for handling various endpoints
// export const fetchEndpointsData = async (endpointType: string, request: any) => {
//   const endpoints = {
//     Oee: [
//       'getOverall',
//       'getByTime',
//       'getByMachine',
//       'getOeeByShiftByType',
//       'getOEEBreakdown',
//       'getOEEByProductionLine',
//       'getOEEByComponent',
//     ],
//     Availability: [
//       'getOverall',
//       'getByTime',
//       'getByMachine',
//       'getOeeByShiftByType',
//     ],
//     DownTime: [
//       'getOverall',
//       'getByTime',
//       'getByMachine',
//       'getOeeByShiftByType',
//     ],
//     Quality: [
//       'getOverall',
//       'getByTime',
//       'getByMachine',
//       'getOeeByShiftByType',
//       'qualityByProduct',
//       'defectsByReason',
//       'qualityLossByProductionLine',
//       'defectDistributionByProduct',
//       'defectTrendByTime',
//       'getGoodVsBadQtyForResource', 
//       'getScrapAndReworkTrend'
//     ],
//     Performance: [
//       'getOverall',
//       'getByTime',
//       'getByMachine',
//       'getOeeByShiftByType',
//       'performanceByProductionLine'
//     ]
//   };

//   const selectedEndpoints = endpoints[endpointType];
//   const results = await Promise.all(selectedEndpoints.map(endpoint => 
//     api.post(`/oee-service/${endpoint}`,  request )
//   ));
//   console.log(results,'oeeresult');
  
  
//   return results.map(res => res.data);
// };
