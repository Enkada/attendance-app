import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from '../node_modules/react-router-dom/dist/index'

import { axios } from '../node_modules/@bundled-es-modules/axios';
axios.defaults.baseURL = 'http://127.0.0.1:4000/api';
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <App />
    </BrowserRouter>,
)
