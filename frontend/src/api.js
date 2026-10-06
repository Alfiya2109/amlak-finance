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

// Demo fallback mock interceptor for static Vercel hosting
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();

    console.warn(`[Amlak Finance Demo Mode] Backend unavailable for ${method.toUpperCase()} ${url}. Serving local demo data.`);

    // 1. Auth Login
    if (url.includes('/auth/login')) {
      return Promise.resolve({
        data: {
          require2FA: true,
          userId: 1,
          tempToken: 'temp_demo_token_amlak',
          currentTotpCode: '406017',
          qrCodeImageDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23064e3b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12">AMLAK 2FA</text></svg>',
          twoFactorSecret: 'JBSWY3DPEHPK3PXP'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }

    // 2. Auth Verify 2FA
    if (url.includes('/auth/verify-2fa')) {
      return Promise.resolve({
        data: {
          accessToken: 'amlak_demo_access_token_jwt',
          user: {
            id: 1,
            username: 'admin2',
            role: 'ADMIN',
            fullName: 'Alfiya Khan (Admin)'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }

    // 3. Letters list
    if (url.includes('/letters')) {
      return Promise.resolve({
        data: [
          {
            id: '7a0133c3-a8a6-4835-8f66-fa5421d971ae',
            letterNumber: 'AMLAK-2026-08912',
            customerName: 'Alfiya Khan',
            bankName: 'Emirates NBD',
            liabilityAmount: 150000.00,
            issueDate: '2026-09-28',
            expiryDate: '2026-10-28',
            status: 'VERIFIED',
            qrCode: 'https://amlak-finance-frontend.vercel.app/verify/AMLAK-2026-08912'
          },
          {
            id: '8083b206-df90-41bf-ac54-ee6fb1049b8a',
            letterNumber: 'AMLAK-2026-04198',
            customerName: 'Swedish Logistics AB',
            bankName: 'Dubai Islamic Bank',
            liabilityAmount: 420000.00,
            issueDate: '2026-09-25',
            expiryDate: '2026-10-25',
            status: 'VERIFIED',
            qrCode: 'https://amlak-finance-frontend.vercel.app/verify/AMLAK-2026-04198'
          }
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }

    return Promise.reject(error);
  }
);

export default API;
