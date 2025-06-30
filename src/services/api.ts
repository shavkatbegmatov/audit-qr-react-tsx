// api.ts
import axios from 'axios'
import authService from './authService'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + 'auth',
    withCredentials: true
})

// подставляем accessToken в заголовок
api.interceptors.request.use(cfg => {
    const isAuthCall = cfg.url?.startsWith('/auth/')
    const token = localStorage.getItem('accessToken')
    if (!isAuthCall && token && cfg.headers) {
        cfg.headers.Authorization = `Bearer ${token}`
    }
    return cfg
})

// очередь запросов, пока идёт обновление токена
let isRefreshing = false
let queue: Array<{
    resolve: (token: string) => void
    reject: (err: any) => void
}> = []

const processQueue = (err: any, token: string | null = null) => {
    queue.forEach(p => {
        if (err) p.reject(err)
        else p.resolve(token!)
    })
    queue = []
}

api.interceptors.response.use(
    res => res,
    err => {
        const originalReq = err.config;
        if (err.response?.status === 401 && !originalReq._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queue.push({ resolve, reject });
                }).then(token => {
                    originalReq.headers.Authorization = `Bearer ${token}`;
                    return axios(originalReq);
                }).catch(err => {
                    console.error('Queue processing failed:', err); // Log error
                    return Promise.reject(err);
                });
            }

            originalReq._retry = true;
            isRefreshing = true;

            return authService
                .refreshToken()
                .then(({ accessToken }) => {
                    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                    processQueue(null, accessToken);
                    originalReq.headers.Authorization = `Bearer ${accessToken}`;
                    return axios(originalReq);
                })
                .catch(err2 => {
                    console.error('Token refresh failed:', err2.message); // Log specific error
                    processQueue(err2, null);
                    authService.logout();
                    return Promise.reject(err2);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        }

        console.error('API error:', err); // Log all other errors
        return Promise.reject(err);
    }
);

export default api
