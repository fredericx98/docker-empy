import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Overview     from './pages/bplaybet/Overview'
import Operaciones  from './pages/bplaybet/Operaciones'
import Ejecuciones  from './pages/bplaybet/Ejecuciones'
import Plesk        from './pages/plesk/Plesk'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/bplaybet/overview" replace />} />
          <Route path="bplaybet/overview"    element={<Overview />} />
          <Route path="bplaybet/operaciones" element={<Operaciones />} />
          <Route path="bplaybet/ejecuciones" element={<Ejecuciones />} />
          <Route path="plesk"                element={<Plesk />} />
          <Route path="*"                    element={<Navigate to="/bplaybet/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
