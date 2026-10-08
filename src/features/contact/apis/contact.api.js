import { publicApi } from '../../../shared/services/api';

export const submitContactMessage = async (payload) => {
  const response = await publicApi.post('/contact', payload);
  return response.data;
};
