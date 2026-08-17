export interface Lesson {
  id: number;
  memberId: number;
  /** The professional giving the lesson. */
  proId: number;
  /** The day of the lesson. */
  onDay: string;
  /** How long the lesson ran, in minutes. */
  minutes: number;
  /** The pro's rate per hour, in whole pence. */
  ratePence: number;
  /** The rate applied to the minutes, fixed when the lesson was booked. */
  chargePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonRow {
  id: number;
  member_id: number;
  pro_id: number;
  on_day: string;
  minutes: number;
  rate_pence: number;
  charge_pence: number;
  created_at: string;
  updated_at: string;
}

export interface LessonDraft {
  proId: number;
  onDay: string;
  minutes: number;
  ratePence: number;
}

export interface NewLesson extends LessonDraft {
  memberId: number;
  chargePence: number;
}
