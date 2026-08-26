import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MapPage from './pages/MapPage'
import KindPage from './pages/KindPage'
import CheckinPage from './pages/CheckinPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/secret" element={<KindPage kind="secret" />} />
        <Route path="/campsite" element={<KindPage kind="campsite" />} />
        <Route path="/charge" element={<KindPage kind="charge" />} />
        <Route path="/water" element={<KindPage kind="water" />} />
        <Route path="/supply" element={<KindPage kind="supply" />} />
        <Route path="/checkin" element={<CheckinPage />} />
      </Routes>
    </Layout>
  )
}