import axios from 'axios';

export const getApiClient = async () => {
  const defaults = {
    baseURL: 'https://deckofcardsapi.com/api/deck',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  };

  return axios.create(defaults);
};
