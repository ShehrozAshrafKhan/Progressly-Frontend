//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './axiosConfig';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { UserProvider } from './contexts/UserContext.tsx';
createRoot(document.getElementById('root')!).render(
//  <StrictMode>
    <UserProvider>
    <App />
    </UserProvider>
  //</StrictMode>,
)
