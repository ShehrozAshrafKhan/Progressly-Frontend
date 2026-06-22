// axiosConfig.js
import axios from 'axios';
import Cookies from 'js-cookie';
import config from './config';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
      const token = Cookies.get('token') || localStorage.getItem('token');

      if (!refreshToken || !token) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${config.baseUrl}Auth/refresh-token`, {
          token: token,
          refreshToken: refreshToken,
        });

        const result = response.data.result;
        if (result.succeeded && response.data.data?.token) {
          const newAccessToken = response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;

          Cookies.set('token', newAccessToken, { expires: 1 });
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          localStorage.setItem('token', newAccessToken);

          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.token = newAccessToken;
            localStorage.setItem("user", JSON.stringify(userObj));
          }

          axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

          processQueue(null, newAccessToken);
          return axios(originalRequest);
        } else {
          processQueue(error, null);
          handleLogout();
          return Promise.reject(error);
        }
      } catch (err) {
        processQueue(err, null);
        handleLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/';
}
