import api from './api';

const getMaterialData = async () => {
  const response = await api.get('/material');
  return response.data;
};

export { getMaterialData };
