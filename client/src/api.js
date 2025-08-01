// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // or your backend URL
});

export default api;
