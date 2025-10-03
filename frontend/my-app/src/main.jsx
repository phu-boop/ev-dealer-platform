import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import AppRoutes from './routes/index.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} />
            <AppRoutes/>
        </BrowserRouter>
    </StrictMode>
)
