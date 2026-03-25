import axios from 'axios';

const BASE_URL = 'http://192.168.1.4:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Request එකක් වෙනුවෙන් තත්පර 60ක් බලන් ඉන්නවා (විශේෂයෙන් Wi-Fi සඳහා)
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

    const retryCount = config.retryCount || 0;
    if (!response && config && !config._retry && retryCount < 3) {
      config._retry = true;
      config.retryCount = retryCount + 1;

      console.log(`🔄 Retrying... Attempt ${config.retryCount}`);

      // පොඩි වෙලාවක් ඉඳලා ආයෙත් Try කරමු (Exponential Backoff)
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      return api(config);
    }

    // Error එක විස්තරාත්මකව Log කරමු (Option A)
    if (error.code === 'ECONNABORTED') {
      console.warn('❌ Network Timeout: Backend එක ගොඩක් වෙලා ගන්නවා');
    } else if (!response) {
      console.warn('❌ Network Error: 172.28.39.239:8080 ට කතා කරන්න බැහැ. Firewall එක check කරන්න.');
    } else {
      console.warn('❌ Server Error:', {
        status: response.status,
        method: config?.method,
        url: config?.url,
        responseBody: response?.data,
      });
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
    console.warn('❌ Backend έκ unreachable:', {
      code: error?.code,
      message: error?.message,
      status: error?.response?.status,
    });
    return {
      connected: false,
      error: error?.message || 'Connection failed',
      hint: `Frontend: http://172.28.39.239:8080/api ට යන්න බැරි. Firewall එක check කරන්න හෝ devices දෙකම එකම Wi-Fi එකට connect කරන්න.`
    };
  }
};
