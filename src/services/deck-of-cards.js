import { getApiClient } from '../config/api';

export const shuffleCards = async (params) => {
  const apiClient = await getApiClient();

  return apiClient.get('new/shuffle/', { params });
};

export const drawCard = async (deckId, params) => {
  const apiClient = await getApiClient();

  return apiClient.get(`${deckId}/draw`, { params });
};
