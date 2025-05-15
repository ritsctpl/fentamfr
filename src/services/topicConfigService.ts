import api from './api';

export const fetchTopicConfiguration = async () => {
  const response = await api.get('integration-service/topic-configurations/getAllConfigurations');
  return response.data;
};

export const RetriveTopicConfigurationRow = async (id: any) => {
    const response = await api.get(`integration-service/topic-configurations/${id}`);
    return response.data;
  };
  
  export const CreateTopicConfiguration = async (payload: object) => {
    const response = await api.post('integration-service/topic-configurations/createConfiguration', payload );
    return response.data;
  };
  
  export const UpdateTopicConfiguration = async (id: string, payload: object) => {
    const response = await api.put(`integration-service/topic-configurations/${id}`, payload );
    return response.data;
  };

export const DeleteTopicConfiguration = async (id: string) => {
    const response = await api.delete(`integration-service/topic-configurations/${id}`);
    return response.data;
  };
