import axios from 'axios';

const BASE_URL = 'http://10.93.125.239:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Request එකක් වෙනුවෙන් තත්පර 60ක් බලන් ඉන්නවා (විශේෂයෙන් Wi-Fi සඳහා)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Request එකක් යන්න කලින් Log කරමු
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
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

      console.log(`Retrying... Attempt ${config.retryCount}`);

      // පොඩි වෙලාවක් ඉඳලා ආයෙත් Try කරමු (Exponential Backoff)
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      return api(config);
    }

    // Error එක විස්තරාත්මකව Log කරමු (Option A)
    if (error.code === 'ECONNABORTED') {
      console.warn('Network Timeout: Backend එක ගොඩක් වෙලා ගන්නවා');
    } else if (!response) {
      console.warn('Network Error: 172.28.39.239:8080 ට කතා කරන්න බැහැ. Firewall එක check කරන්න.');
    } else {
      console.warn('Server Error:', {
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
    console.log('Testing backend connection to:', BASE_URL);
    const response = await api.get('/users/all');
    console.log('Backend එක responsive ය!', response.status);
    return { connected: true, status: response.status };
  } catch (error: any) {
    console.warn('Backend unreachable:', {
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

// --- Forum API ---
export const forumApi = {
  createQuestion: (data: any) => api.post('/forum/questions', data),
  getQuestionsByModule: (moduleCode: string) => api.get(`/forum/questions/module/${moduleCode}`),
  updateQuestion: (id: number, data: any, userId: string) => api.put(`/forum/questions/${id}?userId=${userId}`, data),
  deleteQuestion: (id: number, userId: string) => api.delete(`/forum/questions/${id}?userId=${userId}`),
  voteQuestion: (id: number, upvote: boolean, userId: string) => api.post(`/forum/questions/${id}/vote?upvote=${upvote}&userId=${userId}`),
  getPotentialDuplicates: (title: string, moduleCode: string) => api.get(`/forum/questions/duplicates`, { params: { title, moduleCode } }),
  downloadReport: (id: number) => api.get(`/forum/questions/${id}/report`, { responseType: 'blob' }),

  createAnswer: (data: any) => api.post('/forum/answers', data),
  getAnswersForQuestion: (id: number) => api.get(`/forum/questions/${id}/answers`),
  updateAnswer: (id: number, data: any, userId: string) => api.put(`/forum/answers/${id}?userId=${userId}`, data),
  deleteAnswer: (id: number, userId: string) => api.delete(`/forum/answers/${id}?userId=${userId}`),
  voteAnswer: (id: number, upvote: boolean, userId: string) => api.post(`/forum/answers/${id}/vote?upvote=${upvote}&userId=${userId}`),
};

// --- Resource API ---
export const resourceApi = {
  createResource: (data: any) => api.post('/resources', data),
  getResourcesByModule: (moduleCode: string) => api.get(`/resources/module/${moduleCode}`),
  updateResource: (id: number, uploaderId: string, title?: string, description?: string) =>
    api.put(`/resources/${id}?uploaderId=${uploaderId}${title ? `&title=${title}` : ''}${description ? `&description=${description}` : ''}`),
  deleteResource: (id: number, uploaderId: string) => api.delete(`/resources/${id}?uploaderId=${uploaderId}`),
  upvoteResource: (id: number) => api.put(`/resources/${id}/upvote`),
  downvoteResource: (id: number) => api.put(`/resources/${id}/downvote`),
  registerDownload: (id: number) => api.put(`/resources/${id}/download`),
};

// --- Academic API ---
export const academicApi = {
  createResult: (data: any) => api.post('/academic', data),
  getResultsByStudent: (studentId: string) => api.get(`/academic/student/${studentId}`),
  updateResult: (id: number, data: any) => api.put(`/academic/${id}`, data),
  deleteResult: (id: number) => api.delete(`/academic/${id}`),
  getCGPA: (studentId: string) => api.get(`/academic/cgpa/${studentId}`),
  getSemesterGPA: (studentId: string, semester: number) => api.get(`/academic/gpa/${studentId}/semester/${semester}`),
  predictGPA: (studentId: string, targetCGPA: number, remainingCredits: number) =>
    api.get(`/academic/predict/${studentId}`, { params: { targetCGPA, remainingCredits } }),
  downloadReport: (studentId: string) => api.get(`/academic/report/${studentId}`, { responseType: 'blob' }),
};

// --- Tutoring API ---
export const tutoringApi = {
  bookSession: (data: any) => api.post('/tutoring/book', data),
  getStudentHistory: (studentId: string) => api.get(`/tutoring/student/${studentId}`),
  getTutorSchedule: (tutorId: string) => api.get(`/tutoring/tutor/${tutorId}`),
  rescheduleSession: (id: number, studentId: string, data: any) => api.put(`/tutoring/${id}/reschedule`, data, { params: { studentId } }),
  cancelSession: (id: number, studentId: string) => api.delete(`/tutoring/${id}/cancel`, { params: { studentId } }),
  acceptSession: (id: number, tutorId: string) => api.put(`/tutoring/${id}/accept`, {}, { params: { tutorId } }),
  declineSession: (id: number, tutorId: string, declineReason: string) => api.put(`/tutoring/${id}/decline`, { declineReason }, { params: { tutorId } }),
  completeSession: (id: number, tutorId: string) => api.put(`/tutoring/${id}/complete`, {}, { params: { tutorId } }),
  downloadReport: (studentId: string) => api.get(`/tutoring/report/${studentId}`, { responseType: 'blob' }),
};

// --- User Search API ---
export const userSearchApi = {
  searchUsers: (query: string) => api.get(`/users/search?query=${query}`)
};

// --- Campus Event API ---
export const campusEventApi = {
  getAllEvents: () => api.get('/events'),
  getEventById: (id: number) => api.get(`/events/${id}`),
  createEvent: (data: any, organizerId: string) => api.post(`/events?organizerId=${organizerId}`, data),
  updateEvent: (id: number, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
  downloadReport: () => api.get('/events/report/pdf', { responseType: 'blob' }),
  markAsGoing: (eventId: number, userId: string) => api.post(`/events/${eventId}/registrations?userId=${userId}`),
  unmarkAsGoing: (eventId: number, userId: string) => api.delete(`/events/${eventId}/registrations?userId=${userId}`),
  getRegistrationStatus: (eventId: number, userId: string) => api.get(`/events/${eventId}/registrations/status?userId=${userId}`)
};
