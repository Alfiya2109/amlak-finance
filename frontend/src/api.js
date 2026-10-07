import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${hostname}:5000`,
});

// Interceptor to add JWT Authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const defaultLettersStore = [
  {
    id: 'dc14a8cf-c4a1-432b-9e12-88a91b2c3d4e',
    letterNumber: 'AMLAK-2026-08912',
    customerName: 'Alfiya Khan',
    bankName: 'Amlak Finance PJSC',
    accountNumber: 'ABCDEFGH123',
    liabilityAmount: 150000.00,
    issueDate: '2026-10-22',
    expiryDate: '2026-10-23',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/dc14a8cf-c4a1-432b-9e12-88a91b2c3d4e'
  },
  {
    id: '7a0133c3-a8a6-4835-8f66-fa5421d971ae',
    letterNumber: 'AMLAK-2026-04198',
    customerName: 'Emirates Trade Corp',
    bankName: 'Amlak Finance PJSC',
    accountNumber: 'asdf123456789',
    liabilityAmount: 420000.00,
    issueDate: '2026-10-08',
    expiryDate: '2026-10-10',
    status: 'ACTIVE',
    issuedBy: { id: '2', username: 'staff1', role: 'USER' },
    qrCode: 'http://192.168.0.113:5173/verify/7a0133c3-a8a6-4835-8f66-fa5421d971ae'
  },
  {
    id: '8083b206-df90-41bf-ac54-ee6fb1049b8a',
    letterNumber: 'AMLAK-2026-05510',
    customerName: 'Dubai Horizon Ltd',
    bankName: 'Emirates NBD',
    accountNumber: 'ENBD99881122',
    liabilityAmount: 275000.00,
    issueDate: '2026-09-15',
    expiryDate: '2026-09-29',
    status: 'EXPIRED',
    issuedBy: { id: '2', username: 'staff1', role: 'USER' },
    qrCode: 'http://192.168.0.113:5173/verify/8083b206-df90-41bf-ac54-ee6fb1049b8a'
  },
  {
    id: '9123c456-bf78-4901-a123-bcdef456789a',
    letterNumber: 'AMLAK-2026-07734',
    customerName: 'Sharjah Real Estate',
    bankName: 'Dubai Islamic Bank',
    accountNumber: 'DIB44556677',
    liabilityAmount: 890000.00,
    issueDate: '2026-10-01',
    expiryDate: '2026-11-01',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/9123c456-bf78-4901-a123-bcdef456789a'
  },
  {
    id: 'b234d567-ca89-4012-b234-cdef567890ab',
    letterNumber: 'AMLAK-2026-09912',
    customerName: 'Abu Dhabi Investments',
    bankName: 'First Abu Dhabi Bank',
    accountNumber: 'FAB11223344',
    liabilityAmount: 620000.00,
    issueDate: '2026-10-03',
    expiryDate: '2026-11-03',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/b234d567-ca89-4012-b234-cdef567890ab'
  }
];

// Helper functions for persistent localStorage letters store
const getStoredLetters = () => {
  try {
    const saved = localStorage.getItem('amlak_demo_letters_store');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...defaultLettersStore];
};

const saveStoredLetters = (letters) => {
  try {
    localStorage.setItem('amlak_demo_letters_store', JSON.stringify(letters));
  } catch (e) {}
};

let mockLettersStore = getStoredLetters();

// Response Interceptor: propagate errors cleanly to components
API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
