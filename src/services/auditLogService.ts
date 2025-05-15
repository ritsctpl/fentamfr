import api from "./api";

export const searchAuditLog = async (site: string, userId: string, values: any) => {
    const response = await api.post('/auditlog-service/retrieve', { site, userId, ...values });
    return response.data;
  };


  export const fetchTop50Sites = async () => {
    const response = await api.post('/site-service/retrieveTop50', );
    return response?.data?.retrieveTop50List;
  };

  export const get24HoursData = async (payload: any) => {
    const response = await api.post('/auditlog-service/retrieve', payload);
    return response.data;
  };