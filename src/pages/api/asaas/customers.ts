import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await axios.post(`${ASAAS_API_URL}/customers`, req.body, {
      headers: {
        'access_token': $aact_MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk4NTg4YzBiLTU0YTAtNDRjMi05OTljLTMzMzdkYjY5MWYxMDo6JGFhY2hfYjY5OWZhZjktNWE5MS00MDRmLWJhODQtNmM1NjZjM2E4NmQ4,
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro na API do Asaas:', error);
    return res.status(500).json({ 
      message: 'Erro ao criar cliente no Asaas',
      error: error.response?.data || error.message 
    });
  }
}
