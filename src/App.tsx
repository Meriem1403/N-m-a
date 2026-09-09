import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AppProvider } from './store/AppContext'
import { Dashboard } from './pages/Dashboard'
import { Profiles } from './pages/Profiles'
import { ProfileDetail } from './pages/ProfileDetail'
import { ProfileEdit } from './pages/ProfileEdit'
import { ProfileNew } from './pages/ProfileNew'
import { Searches } from './pages/Searches'
import { SearchDetail } from './pages/SearchDetail'
import { SearchNew } from './pages/SearchNew'
import { SearchEdit } from './pages/SearchEdit'
import { Properties } from './pages/Properties'
import { PropertyDetail } from './pages/PropertyDetail'
import { PropertyEdit } from './pages/PropertyEdit'
import { PropertyNew } from './pages/PropertyNew'
import { Matches } from './pages/Matches'
import { History } from './pages/History'
import { Import } from './pages/Import'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profils" element={<Profiles />} />
            <Route path="profils/nouveau" element={<ProfileNew />} />
            <Route path="profils/:id/modifier" element={<ProfileEdit />} />
            <Route path="profils/:id" element={<ProfileDetail />} />
            <Route path="recherches" element={<Searches />} />
            <Route path="recherches/nouveau" element={<SearchNew />} />
            <Route path="recherches/:id/modifier" element={<SearchEdit />} />
            <Route path="recherches/:id" element={<SearchDetail />} />
            <Route path="biens" element={<Properties />} />
            <Route path="biens/nouveau" element={<PropertyNew />} />
            <Route path="biens/:id/modifier" element={<PropertyEdit />} />
            <Route path="biens/:id" element={<PropertyDetail />} />
            <Route path="correspondances" element={<Matches />} />
            <Route path="matchs" element={<Navigate to="/correspondances" replace />} />
            <Route path="historique" element={<History />} />
            <Route path="import" element={<Import />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
