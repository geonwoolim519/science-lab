import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CategoryPage } from './pages/Category'
import { Fields } from './pages/Fields'
import { Home } from './pages/Home'
import { ProgressPage } from './pages/Progress'
import { SearchPage } from './pages/Search'
import { TheoryPage } from './pages/Theory'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="fields" element={<Fields />} />
        <Route path="c/:categoryId" element={<CategoryPage />} />
        <Route path="t/:theoryId" element={<TheoryPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
