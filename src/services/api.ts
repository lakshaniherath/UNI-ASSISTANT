import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Request එකක් වෙනුවෙන් තත්පර 10ක් බලන් ඉන්නවා
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Request එකක් යන්න කලින් Log කරමු
api.interceptors.request.use(request => {
  console.log('🚀 Starting Request:', request.url);
  return request;
});

// Response Interceptor: Retry logic සහ Error logging මෙතනදී කරනවා
api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;

    // Network error එකක් නම් හෝ Timeout වුණොත් 3 වතාවක් Retry කරනවා
    if (!response && config && !config._retry && config.retryCount < 3) {
      config._retry = true;
      config.retryCount = (config.retryCount || 0) + 1;
      
      console.log(`🔄 Retrying... Attempt ${config.retryCount}`);
      
      // පොඩි වෙලාවක් ඉඳලා ආයෙත් Try කරමු (Exponential Backoff)
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(config);
    }

    // Error එක විස්තරාත්මකව Log කරමු (Option A)
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Network Timeout: Backend එක ගොඩක් වෙලා ගන්නවා');
    } else if (!response) {
      console.error('❌ Network Error: 10.0.2.2 ට කතා කරන්න බැහැ. Firewall එක check කරන්න.');
    } else {
      console.error(`❌ Server Error: ${response.status}`);
    }

    return Promise.reject(error);
  }
);

// Backend එක reachable ද නැත්තේ ඒක test කරන function එක
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection to:', BASE_URL);
    const response = await api.get('/users/all');
    console.log('✅ Backend එක responsive ය!', response.status);
    return { connected: true, status: response.status };
  } catch (error: any) {
    console.error('❌ Backend έκ unreachable:', {
      code: error?.code,
      message: error?.message,
      status: error?.response?.status,
    });
    return { 
      connected: false, 
      error: error?.message || 'Connection failed',
      hint: `Frontend: http://10.0.2.2:8080/api ට යන්න බැරි. Firewall එක check කරන්න හෝ backend restart කරන්න.`
    };
  }
};