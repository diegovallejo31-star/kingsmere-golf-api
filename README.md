# kingsmere-golf-api

The back office for a group of golf clubs: members and what they are billed for,
the tee sheet and the competitions, the locker banks and the pro's diary.

A plain Express + TypeScript service over SQLite, no framework beyond that. Every
module is the same six files - types, schema, repository, service, controller,
routes - so once you have read one you know your way around them all.

```sh
npm install
npm run dev      # a watch server on the port in src/config/env.ts
npm run check    # typecheck, eslint, prettier, jest - all of it
```

## What is in it

A club (`/clubs`) has staff, competitions and locker banks. A member
(`/members`) takes a subscription at a category (`/categories`), books tee times
and signs in guests, enters competitions, rents a locker, and has lessons with
the pro. When the season is billed, a member's subscription, lessons and entries
are gathered onto an invoice and paid off. Members carry a handicap history,
buggies go out on a booking, and visitors pay a green fee at the door. Auth,
API keys and the audit trail sit underneath all of it.

See [docs/domain.md](docs/domain.md) for the conventions the whole codebase
holds to - they are assumed, not repeated, in each module.

## The shape of a request

Everything is JSON. A write answers `201` with the row it created, a read
answers `200`, a bad body answers `400`, something missing answers `404`, and a
rule broken answers `409`. Lists come back as `{ "items": [...] }` and take
`limit` and `offset`; unknown query keys are refused rather than ignored.
