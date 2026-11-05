export interface LessonState {
  lessonId: string
  completedAt?: string // ISO date
  questionResults: Record<string, { correct: boolean; attempts: number; lastSeen: string }>
}

export interface ReviewItem {
  questionId: string
  dueAt: string // ISO date
  interval: number // days
  easeFactor: number
}

export interface ProgressStore {
  getLessonState(id: string): Promise<LessonState | null>
  saveLessonState(id: string, s: LessonState): Promise<void>
  getReviewQueue(): Promise<ReviewItem[]>
  recordAnswer(questionId: string, correct: boolean): Promise<void>
  exportAll(): Promise<Blob>
  importAll(file: Blob): Promise<void>
}
