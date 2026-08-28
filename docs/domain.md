# The house style

These hold everywhere. They are written down once, here, and assumed in every
module rather than restated - a task written against this repo is expected to
know them.

## Days and windows

* A **day** is a `YYYY-MM-DD` string and nothing else. A day is compared as a
  string, which works because the format sorts. `src/lib/schemas.ts` has the
  shared `dayString`, and it refuses a date that never happened.
* A **season** is a half-open window: the first day is in, the day after the last
  is out. Its length is the days between the two, and a member's cover is the
  days from when they join up to that end.
* Nothing reads the clock in a calculation. The day a member joins and the
  bounds of the season both arrive from the caller, so a subscription always
  works out to the same figure.

## Money

* Money is **whole pence**, held as an integer everywhere. No floating point in
  a money path.
* A **subscription is apportioned**. A member who joins on the first day of the
  season pays the full category rate; one who joins partway through pays the rate
  scaled by the days of the season still ahead of them, rounded to the penny
  once. The rate is read off the category at that moment and the answer is kept.
* A **lesson is charged to the minute**: the pro's hourly rate scaled by the
  minutes taught. A locker rental and a competition entry copy their fee at the
  moment they are taken.
* A tax rate is **basis points**: 2000 is the 20% VAT. `bpsOf` rounds once, and
  VAT is taken on the net so the columns add back up.
* A figure worked out from others - a subscription, a lesson charge, an invoice's
  totals - is **fixed when the record is raised and then stored**, never
  recomputed on read. The rate card moves; the member's figure does not.

## State

* Records that settle once - a booking played or cancelled, an entry withdrawn,
  a rental ended, a subscription lapsed - settle once and do not reopen.
* A locker is `vacant` or `let`, and only a rental moves it between the two. The
  club cannot flip it by hand, because the locker's state and the member's key
  must never disagree.
* Only standing lines are billed: a lapsed subscription or a withdrawn entry is
  left off the invoice.

## Not built yet

Subscriptions are raised one at a time by hand. There is no renewals run that
takes every active subscription at a season's end and raises next season's at
the new rate - the office does each one. That renewals job is the obvious next
thing, and the first task against this repo builds it.
