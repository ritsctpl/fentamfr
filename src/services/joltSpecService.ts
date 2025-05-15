import api from './api';

export const fetchTop50Specs = async (site: any) => {
  const response = await api.get(`integration-service/jolt-spec/all/specNames/${site}`);
  // console.log(response,'Activity Top 50 Response');
  
  return response.data;
};

export const createSpec = async (request: any) => {
  try {
    const response = await api.post('/integration-service/jolt-spec/create', request);
    // console.log('Create Activity Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating spec:', error);
    throw error;
  }
};

export const updateSpec = async (request: any) => {
  try {
    const response = await api.post('/integration-service/jolt-spec/update', request);
    // console.log('Update Activity Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error updating spec:', error);
    throw error;
  }
};



export const retrieveSpec = async (request: { site: any, specName: any } )   => {
  
  const response = await api.get(`/integration-service/jolt-spec/byName/${request.site}/${request.specName}`);
  // console.log(response,'retrieve activity Response');
  return response.data;
};



export const encodeSpec = async (request: string) => {
  // debugger;
  try {
    const response = await api.post('/integration-service/jolt-spec/encode', request, {
      headers: {
        'Content-Type': 'text/plain', // Use application/xml for XML payloads
      },
    });
    // console.log('Encode spec response:', response.data);
    return response.data;
  } catch (error) {
    // console.error('Error encoding spec:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const decodeSpec = async (request: string) => {
  // debugger;
  try {
    const response = await api.post('/integration-service/jolt-spec/decode', request, {
      headers: {
        'Content-Type': 'text/plain', // Use application/xml for XML payloads
      },
    });
    // console.log('Encode spec response:', response.data);
    return response.data;
  } catch (error) {
    // console.error('Error encoding spec:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const retrieveXsltSpec = async (specName: any )   => {
  debugger
  const response = await api.post(`/integration-service/jolt-spec/decodedXslt/${specName}`);
  console.log(response,'retrieve xslt spec Response');
  return response.data;
};

export const retrieveJsonAtaSpec = async (specName: any )   => {
  debugger
  const response = await api.post(`/integration-service/jolt-spec/decodedJsonata/${specName}`);
  console.log(response,'retrieve jsonAta spec Response');
  return response.data;
};

export const retrieveAllSpec = async (request: any )   => {
  debugger                     
  const response = await api.post('/integration-service/jolt-spec/getBySpecName', {...request});
  console.log(response.data,'retrieve all spec Response');
  return response.data; 
};

export const deleteSpec = async (request: any) => {
  const response = await api.post('/integration-service/jolt-spec/delete', {...request});
  // console.log(response,'activity Delete Response');
  
  return response.data;
};





