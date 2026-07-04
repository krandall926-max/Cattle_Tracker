import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Herd from './pages/Herd'
import AnimalDetail from './pages/AnimalDetail'
import AnimalForm from './pages/AnimalForm'
import Breeding from './pages/Breeding'
import BreedingForm from './pages/BreedingForm'
import Pastures from './pages/Pastures'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/herd" element={<Herd />} />
        <Route path="/herd/new" element={<AnimalForm />} />
        <Route path="/herd/:id" element={<AnimalDetail />} />
        <Route path="/herd/:id/edit" element={<AnimalForm />} />
        <Route path="/breeding" element={<Breeding />} />
        <Route path="/breeding/new" element={<BreedingForm />} />
        <Route path="/breeding/:id/edit" element={<BreedingForm />} />
        <Route path="/pastures" element={<Pastures />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
