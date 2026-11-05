import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'
import { Home } from './pages/Home'
import { LessonPage } from './pages/LessonPage'
import { Modules } from './pages/Modules'
import { NotFound } from './pages/NotFound'
import { Privacy } from './pages/Privacy'

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="modules" element={<Modules />} />
          <Route path="lessons/:lessonId" element={<LessonPage />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
