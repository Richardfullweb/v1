import axios from 'axios';

const API_TOKEN = '$aact_MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY';
const isProduction = import.meta.env.PROD;
const BASE_URL = isProduction ? 'https://sandbox.asaas.com/api/v3' : '/api/asaas';

export const createCustomer = async (customerData: { name: string; cpfCnpj: string }) => {
  try {
    const response = await axios.post(`${BASE_URL}/customers`, customerData, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error);
    throw error;
  }
};
