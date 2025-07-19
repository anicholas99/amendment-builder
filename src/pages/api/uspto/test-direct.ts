import type { NextApiRequest, NextApiResponse } from 'next';
import { environment } from '@/config/environment';

/**
 * Direct test endpoint to verify USPTO API key and make a direct call
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { applicationNumber = '13937148' } = req.query;
  
  try {
    // Log environment details
    const envInfo = {
      hasApiKey: !!environment.uspto?.apiKey,
      apiKeyLength: environment.uspto?.apiKey?.length || 0,
      apiKeyPrefix: environment.uspto?.apiKey?.substring(0, 4) + '...',
      apiUrl: environment.uspto?.apiUrl,
      rawEnvUrl: process.env.USPTO_ODP_API_URL || 'not set',
      rawEnvKey: process.env.USPTO_ODP_API_KEY?.substring(0, 4) + '...',
      rawEnvKeyLength: process.env.USPTO_ODP_API_KEY?.length || 0,
    };
    
    console.log('USPTO Direct Test - Environment:', envInfo);
    
    // Make direct API call - force correct URL
    const correctApiUrl = 'https://api.uspto.gov/api/v1';
    const url = `${correctApiUrl}/patent/applications/${applicationNumber}/documents`;
    const headers = {
      'Accept': 'application/json',
      'X-API-KEY': environment.uspto.apiKey || process.env.USPTO_ODP_API_KEY || '',
      'User-Agent': 'AmendmentBuilder/1.0',
    };
    
    console.log('Making request to:', url);
    console.log('Headers:', { ...headers, 'X-API-KEY': headers['X-API-KEY'].substring(0, 4) + '...' });
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
    
    return res.status(200).json({
      success: response.ok,
      status: response.status,
      envInfo,
      url,
      response: response.ok ? data : { error: data },
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error('Direct test error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}