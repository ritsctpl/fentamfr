// src/services/activityService.ts

import api from './api';

export const fetchShiftAllData= async (site: string) => {
  const response = await api.post('/shift-service/retrieveAll/', { site });
  console.log(response +'Response')
  return response.data.shiftResponseList;
};
export const fetchShift= async (site: string) => {
  const response = await api.post('/shift-service/retrieveTop50/', { site });
  console.log(response +'Response')
  return response.data.shiftResponseList;
};

export const fetchShiftAll= async (site: string, shiftId ,resourceId?,workCenterId?,shiftType?) => {
  console.log(resourceId,workCenterId,shiftType,"resourceId,workCenterId");
  const param = {shiftId,workCenterId,resourceId,shiftType}
  const response = await api.post('/shift-service/retrieve/', { site,...param });
  console.log(response +'Response')
  return response.data;
};

// In @services/shiftService.js
export const updateShift = async (site: string, userId: string, shiftData: Object) => {
  try {
    console.log("Enter Update");
    const response = await api.post('/shift-service/update', {
      site, // Include site here
      userId, // Include userId here
      ...shiftData, // Include all other fields from shiftData
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
    console.error('Error updating shift:', error);
    throw error; // Re-throw error or handle it according to your needs
  }
};

export const addShift = async (shiftData: Object) => {
  try {
    console.log("Enter add",shiftData);
    const response = await api.post('/shift-service/create', {
     // Include userId here
      ...shiftData, // Include all other fields from shiftData
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add other headers if needed, e.g., Authorization tokens
      },
    });
    // Return the response data
    console.log(response +'Response')
    return response.data;

  } catch (error) {
    // Handle error
    console.error('Error updating shift:', error);
    throw error; // Re-throw error or handle it according to your needs
  }
};


// In @services/shiftService.js
export const deleteShift = async (site: string,userId, shiftData: Object) => {
  try {
    console.log("Enter delete");
    const response = await api.post('/shift-service/delete', {site,userId,...shiftData}, {
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
    console.error('Error deleting shift:', error);
    throw error; // Re-throw error or handle it according to your needs
  }
};
export const copyAllShifts = async (shiftData: Object) => {
  try {
    console.log("Enter Copy",shiftData);
    const response = await api.post('/shift-service/create', {
      // Include userId here
      ...shiftData, // Include all other fields from shiftData
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
    console.error('Error Copy shift:', error);
    throw error; // Re-throw error or handle it according to your needs
  }
};

