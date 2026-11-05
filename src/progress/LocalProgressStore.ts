import type { LessonState, ProgressStore, ReviewItem } from './ProgressStore'

const LESSON_PREFIX = 'gs:lesson:'
const REVIEW_KEY = 'gs:review'

// SM-2 spaced repetition constants
const INITIAL_INTERVAL = 1
const INITIAL_EASE = 2.5
const MIN_EASE = 1.3

function now(): string {
  return new Date().toISOString()
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export class LocalProgressStore implements ProgressStore {
  async getLessonState(id: string): Promise<LessonState | null> {
    const raw = localStorage.getItem(`${LESSON_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as LessonState) : null
  }

  async saveLessonState(id: string, s: LessonState): Promise<void> {
    localStorage.setItem(`${LESSON_PREFIX}${id}`, JSON.stringify(s))
  }

  async getReviewQueue(): Promise<ReviewItem[]> {
    const raw = localStorage.getItem(REVIEW_KEY)
    const all: ReviewItem[] = raw ? (JSON.parse(raw) as ReviewItem[]) : []
    const today = now()
    return all.filter((item) => item.dueAt <= today)
  }

  async recordAnswer(questionId: string, correct: boolean): Promise<void> {
    const raw = localStorage.getItem(REVIEW_KEY)
    const all: ReviewItem[] = raw ? (JSON.parse(raw) as ReviewItem[]) : []

    const idx = all.findIndex((r) => r.questionId === questionId)
    if (idx === -1) {
      // First encounter
      all.push({
        questionId,
        dueAt: addDays(now(), correct ? INITIAL_INTERVAL : 0),
        interval: correct ? INITIAL_INTERVAL : 0,
        easeFactor: INITIAL_EASE,
      })
    } else {
      const item = all[idx]!
      if (correct) {
        const newInterval = Math.round(item.interval * item.easeFactor)
        const newEase = Math.max(MIN_EASE, item.easeFactor + 0.1)
        all[idx] = { ...item, interval: newInterval, easeFactor: newEase, dueAt: addDays(now(), newInterval) }
      } else {
        all[idx] = { ...item, interval: 1, dueAt: addDays(now(), 1) }
      }
    }

    localStorage.setItem(REVIEW_KEY, JSON.stringify(all))
  }

  async exportAll(): Promise<Blob> {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('gs:')) {
        const val = localStorage.getItem(key)
        if (val) data[key] = JSON.parse(val)
      }
    }
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }

  async importAll(file: Blob): Promise<void> {
    const text = await file.text()
    const data = JSON.parse(text) as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('gs:')) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  }
}
