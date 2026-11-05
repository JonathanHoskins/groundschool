import { MDXProvider } from '@mdx-js/react'
import { Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'
import { NotFound } from './NotFound'

// All MDX lessons, keyed by filename without extension
const lessons = import.meta.glob('../../content/lessons/*.mdx') as Record<
  string,
  () => Promise<{
    default: React.ComponentType
    frontmatter?: {
      title?: string
      acsRefs?: string[]
      sources?: Array<{ doc: string; ref: string }>
    }
  }>
>

function getLessonLoader(id: string) {
  const key = `../../content/lessons/${id}.mdx`
  return lessons[key] ?? null
}

interface LessonModuleProps {
  id: string
}

function LessonModule({ id }: LessonModuleProps) {
  const loader = getLessonLoader(id)
  if (!loader) return <NotFound />

  const Content = lazy(loader)

  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-slate-400 dark:text-slate-600">Loading…</div>
      }
    >
      <MDXProvider>
        <Content />
      </MDXProvider>
    </Suspense>
  )
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  if (!lessonId) return <NotFound />
  return <LessonModule id={lessonId} />
}
