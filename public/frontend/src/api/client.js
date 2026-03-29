import axios from 'axios';

// const API = axios.create({
//     baseURL: 'http://localhost/fabricon-ci4/public/api',
// });

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
});


// Add a request interceptor to include auth token
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('adminInfo')
        ? JSON.parse(localStorage.getItem('adminInfo'))
        : null;

    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
});

export default API;
