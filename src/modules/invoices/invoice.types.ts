export interface Invoice {
  id: number;
  /** The member being billed. */
  memberId: number;
  /** The invoice number on the paperwork. */
  number: string;
  /** The day the invoice was raised. */
  raisedOn: string;
  /** Standing subscriptions. */
  subscriptionPence: number;
  /** Lessons taken. */
  lessonsPence: number;
  /** Competition entries. */
  entriesPence: number;
  /** The three added up, before VAT. */
  netPence: number;
  /** VAT on the net. */
  vatPence: number;
  /** What the member owes. */
  grossPence: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRow {
  id: number;
  member_id: number;
  number: string;
  raised_on: string;
  subscription_pence: number;
  lessons_pence: number;
  entries_pence: number;
  net_pence: number;
  vat_pence: number;
  gross_pence: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDraft {
  memberId: number;
  number: string;
  raisedOn: string;
}

export interface NewInvoice extends InvoiceDraft {
  subscriptionPence: number;
  lessonsPence: number;
  entriesPence: number;
  netPence: number;
  vatPence: number;
  grossPence: number;
}
