import api from './api';

export const fetchProcessedMessagesTop50 = async (site: string) => {
    const response = await api.get('/integration-service/processed-messages/retrieveTop50');
    console.log(response,"fetchProcessedMessagesTop50");
    return response.data;
};
export const fetchProcessedMessagesWithFilters = async (
  startDate: string,
  endDate: string,
  filters: {
    status?: string;
    topicName?: string;
  }
) => {
  // Create an object with all possible parameters
  const params: Record<string, string> = {};

  // Only add parameters if they have values
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (filters.status) params.status = filters.status;
  if (filters.topicName) params.topicName = filters.topicName;

  // Create query string from non-empty parameters
  const queryString = Object.entries(params)
    .map(([key, value]) => {
      // Don't encode colons and other date-related characters for date fields
      if (key === 'startDate' || key === 'endDate') {
        return `${key}=${value}`;
      }
      // Encode other parameters normally
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  const url = `/integration-service/processed-messages/retrieveAllForFilters${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data;
};