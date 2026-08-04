/** Whether the subscription still stands. */
export type SubscriptionStatus = 'active' | 'lapsed';

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'lapsed'];

export interface Subscription {
  id: number;
  memberId: number;
  /** The category whose rate this is worked out from. */
  categoryId: number;
  /** First day of the playing year. */
  seasonStart: string;
  /** Day after the last - the season is half-open. */
  seasonEnd: string;
  /** The day this member's cover starts. */
  startedOn: string;
  /** The apportioned subscription, fixed when it was raised. */
  amountPence: number;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRow {
  id: number;
  member_id: number;
  category_id: number;
  season_start: string;
  season_end: string;
  started_on: string;
  amount_pence: number;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDraft {
  categoryId: number;
  seasonStart: string;
  seasonEnd: string;
  startedOn: string;
}

export interface NewSubscription extends SubscriptionDraft {
  memberId: number;
  amountPence: number;
}
