import axios from 'axios';

// Android emulator eken local backend ekata connect wenna '10.0.2.2' use karanna ona.
// (iOS simulator ekak nam 'localhost' danna. Real phone ekak nam PC eke WiFi IP eka danna)
const BASE_URL = 'http://10.0.2.2:8080/api/users';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});