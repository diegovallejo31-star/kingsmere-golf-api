export interface Category {
  id: number;
  /** Short category code. */
  code: string;
  /** What the category is called on the subscription form. */
  name: string;
  /** A full year at this category, in whole pence. */
  annualRatePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRow {
  id: number;
  code: string;
  name: string;
  annual_rate_pence: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryDraft {
  code: string;
  name: string;
  annualRatePence: number;
}

export type NewCategory = CategoryDraft;

export interface CategoryPatch {
  annualRatePence?: number;
}
