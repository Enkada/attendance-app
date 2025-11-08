import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from '../node_modules/react-router-dom/dist/index'

import { axios } from '../node_modules/@bundled-es-modules/axios';
axios.defaults.baseURL = 'https://api.enkada.dev/ispo';
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/ispo">
      <App />
    </BrowserRouter>,
)
