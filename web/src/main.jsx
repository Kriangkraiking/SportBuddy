import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// เพิ่มบรรทัดนี้ลงไปเพื่อให้สไตล์ของ Bootstrap ทำงาน
import 'bootstrap/dist/css/bootstrap.min.css'; 

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)