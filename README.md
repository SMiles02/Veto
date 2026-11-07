# Veto

**A Cork student housing co-pilot. Walk away, negotiate, or proceed before you send the deposit.**

[![Corkathon 2026](https://img.shields.io/badge/Corkathon-2026-0f766e)](https://corkathon.devpost.com/)
[![Live demo](https://img.shields.io/badge/demo-veto--smoky.vercel.app-b91c1c)](https://veto-smoky.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![OPW floodinfo](https://img.shields.io/badge/data-OPW%20floodinfo.ie-0f766e)](https://www.floodinfo.ie/)

> Scan the listing. Check the rent. Check the flood. Check the register. Then decide.

**Live:** [veto-smoky.vercel.app](https://veto-smoky.vercel.app) · **Code:** [github.com/SMiles02/Veto](https://github.com/SMiles02/Veto)

## Challenge

Cork students are hunting rooms under pressure: WhatsApp deposits, thin ads, rents that don't match the street, and neighbourhood risks that only show up after you move in.

We wanted a tool that feels like a careful friend on campus, not a black-box score. Something that explains its reasons, cites its sources, and still tells you to view in person.

## Solution

**Veto** is a Next.js app that scores a Cork listing into a clear stamp:

| Stamp | Meaning |
| --- | --- |
| **VETO** | Walk away. Basic scam checks failed. |
| **NEGOTIATE** | Not a hard no. Don't accept these terms as they stand. |
| **CLEAR** | Nothing major jumped out. Still view before you pay. |

Behind that stamp we combine scam heuristics, fair-rent comps from real ads, neighbourhood notes, OPW flood extents, guided RTB verification, and a lease checker with a student toolkit of rights links.

We tried to stay honest about what we can and cannot know. Planning notes are curated. Flood risk is indicative OPW CFRAM data. RTB Check the Register is a human-guided verify, not a scrape.

## Key features

### Listing scan
- Paste a listing (or load a demo) and get a **VETO / NEGOTIATE / CLEAR** decision with plain-English reasons
- Rule-based **scam signals**: payment before viewing, abroad landlord patterns, underpriced bait, thin contact details, and more
- Optional listing URL autofill where the importer can help

### Fair rent
- Compare asking rent to nearby rooms from a curated comps set
- **62 sourced ads** across Cork student neighbourhoods (Daft.ie and Rent.ie), each with `source` + `sourceUrl`
- Local medians when the area has comps; Cork-wide fallback only when it does not
- Map of nearby rents with cheaper / dearer markers

### Flood risk
- Live point check against **OPW floodinfo.ie** CFRAM river and coastal extents
- Bands from Annual Exceedance Probability (about 1-in-10 through 1-in-1,000 year events)
- Nearby recorded flood events within 500m
- Toggleable map overlay + link back to the official map
- Soft nudge into **NEGOTIATE** when modelled risk is significant or high

### RTB Check the Register
- Deep-link into the official RTB tool
- Student reports **Found = Y/N**, digs exempt, or unsure
- That report can nudge the score; it does not pretend we scraped the register

### Lease + toolkit
- **LeaseLens**: paste or upload lease text, surface risky clauses with suggested replies
- Optional OpenAI assist with a clear fallback to Irish lease rules when the model is unavailable
- Toolkit checklist plus Threshold, RTB, UCC accommodation, and CCPC links

### Cork-first product craft
- Neighbourhood cache across College Road, Western Road, Magazine Road, Sunday's Well, Glasheen, Wilton, Bishopstown, Blackpool, Ballincollig, Douglas, Blackrock, Mahon, Ballyphehane, Turners Cross, and City Centre
- Design that tries to feel like Cork, not a generic AI landing page
- Copy that prefers plain speech over marketing fog

## How it works

1. Enter address, rent, beds, and description (or pick a demo)
2. Veto scores scam risk and fair rent against sourced comps
3. Area intel adds commute, curated planning notes, and an OPW flood check for the pin
4. You optionally verify the address on RTB Check the Register and report what you saw
5. Read the stamp, the reasons, the map, and the flood panel
6. If you proceed, use LeaseLens and the toolkit before you pay

## Quick start

```bash
git clone https://github.com/SMiles02/Veto.git
cd Veto
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional in `.env`:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Lease checking still works without an API key via built-in Irish lease rules.

## Data we ship

| Dataset | Size | Role |
| --- | --- | --- |
| `data/comps.json` | 62 ads | Fair rent + map comps (sourced) |
| `data/areaCache.json` | 15 neighbourhoods | Curated notes / planning context |
| `data/demoListings.json` | 7 demos | Scam, negotiate, flood, outer areas |
| Live OPW WMS/WFS | per pin | Flood extents + past events |

Neighbourhoods with comps today: College Road, Western Road, Magazine Road, Sunday's Well, Gillabbey, Glasheen, Wilton, Bishopstown, Blackpool, Ballincollig, Douglas, Blackrock, Mahon, Ballyphehane, Turners Cross, City Centre.

## Tech stack

- **App:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Maps:** Leaflet / react-leaflet + optional OPW WMS overlay
- **Scoring:** Rule engines in `lib/veto/` (scam, fair rent, flood, RTB, lease, area)
- **Flood:** OPW GeoServer GetFeatureInfo on CFRAM fluvial/coastal layers
- **Lease assist:** pdf-parse + optional OpenAI, with deterministic rule fallback
- **Deploy:** Vercel

### Main routes

- `/` listing scan and decision
- `/lease` LeaseLens
- `/toolkit` rights checklist and links
- `POST /api/veto` score a listing
- `POST /api/area` area intel for a pin
- `POST /api/lease` analyse lease text
- `POST /api/listing/import` listing URL autofill helper

## What we are careful about

- **Not legal advice.** A second opinion for students under time pressure.
- **Flood is indicative**, not a building survey. Always confirm on [floodinfo.ie](https://www.floodinfo.ie/).
- **Planning notes are curated**, not live planning-register matches.
- **Comps are manually sourced** real ads with provenance. We do not scrape RTB or hide behind a fake "live market" claim.
- **Always view in person** before you send money.

## Built for Corkathon 2026

Shipped in a day at Corkathon (UCC Computer Science Society, with IGNITE UCC and Frame): from a student housing pain point to a live demo with sourced comps, flood checks, RTB guidance, lease review, and a toolkit.

### Completed in the hackathon build
- [x] VETO / NEGOTIATE / CLEAR decision stamp
- [x] Scam heuristics tuned for student ads
- [x] Fair rent from sourced Cork comps
- [x] Neighbourhood map with nearby rents
- [x] OPW flood risk checker with provenance
- [x] Guided RTB Check the Register flow
- [x] LeaseLens with rules + optional LLM
- [x] Student rights toolkit
- [x] Deployed production demo on Vercel

### Nice next steps
- [ ] More comps per area and bed count
- [ ] Stronger listing import coverage
- [ ] Persist student-reported RTB outcomes for the team (not as scraped truth)
- [ ] Surface-water / pluvial layers where OPW exposes them cleanly

## Acknowledgments

- **Corkathon 2026**, UCC Computer Science Society, IGNITE UCC, and Frame for the day and the room
- **OPW / floodinfo.ie** for open flood mapping services
- **RTB** for Check the Register
- **Threshold**, **UCC Accommodation**, and **CCPC** for renter guidance we link to
- **Daft.ie** and **Rent.ie** advertisers whose public listings we cite as comps
- Cork students who have been burned by bad deposits and still help the next person look twice

## Built by

- **Suneet Mahajan** - [LinkedIn](https://www.linkedin.com/in/suneetmahajan/) · [GitHub](https://github.com/SMiles02)
- **Bryan Chan** - [LinkedIn](https://www.linkedin.com/in/bryan-chan99/) · [GitHub](https://github.com/the-shibbach)
- **Sean Buckley** - [LinkedIn](https://www.linkedin.com/in/sean-buckley-872606301/)

Built for Corkathon 2026.

---

**View first. Pay later.**

*Before the deposit.*
