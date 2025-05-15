// src/services/activityService.ts

import api from './api';

export const getLogList = async (request: any) => {
  const response = await api.post('/logging-service/logs/filter', request);
  return response?.data;
};




