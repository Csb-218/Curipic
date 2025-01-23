const axios = require('axios');
require('dotenv').config();

const axiosInstance = axios.create({
    baseURL: process.env.UNSPLASH_BASE_URL,
    headers:{
        Authorization : `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    }
    
})

module.exports = axiosInstance;