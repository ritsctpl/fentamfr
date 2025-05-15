import api from "./api";

export const fetchCustomDataTop50 = async (site: string) => {
  const response = await api.post("/customdata-service/retrieveTop50", {
    site,
  });
  // console.log(response.data, "response.data");
  return response.data;
};

export const fetchCustomDataAll = async (site: string) => {
  const response = await api.post("/customdata-service/retrieveAll", { site });
  return response.data;
};

export const fetchDataFieldTop50 = async (site: string, typedValue: string) => {
  const response = await api.post("/datafield-service/retrieveTop50", {
    site,
    typedValue,
  });
  return response.data;
};

export const fetchDataFieldAll = async (site: string, newValue: any) => {
  const response = await api.post("/datafield-service/retrieveAll", {
    site,
    newValue,
  });
  return response.data;
};
export const CustomDataUpdate = async (payload: object) => {
  const response = await api.post("/customdata-service/update", payload);
  // console.log(payload, "payload services");
  return response.data;
};
export const fetchCustomDataRetrive = async (site: string, newValue: any) => {
  const response = await api.post("/customdata-service/retrieveByCategory", {
    site,
    ...newValue,
  });
 
  return response.data;
};
