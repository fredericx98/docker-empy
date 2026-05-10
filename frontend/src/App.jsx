import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Overview from './pages/Overview.jsx'
import Monitoring from './pages/Monitoring.jsx'
import Infrastructure from './pages/Infrastructure.jsx'
import Analytics from './pages/Analytics.jsx'
import Alerts from './pages/Alerts.jsx'
import StepFunctions from './pages/StepFunctions.jsx'
import Config from './pages/Config.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="step-functions" element={<StepFunctions />} />
          <Route path="config" element={<Config />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
