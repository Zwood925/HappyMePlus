# BarBook – MVP Developer Brief

BarBook is a digital notebook for rappers, poets, and lyricists. The app focuses on quick lyric jotting, basic beat generation, and smart writing support rather than full digital audio workstation features.

## Core Features

### Notebook UI
- Create text "pages" to store lyrics.
- Free tier limited to ~3–5 pages; paid users get unlimited pages.

### AI Beat Generator
- Integrate MusicGen or Riffusion for instrumental loops.
- Free: basic styles (hip-hop, trap, lo-fi).
- Paid: more variations and longer loops.

### Smart Writing Assistant
- Rhyme suggestions using simple rhyme-finder or small LLM.
- Cadence helper for syllable breaks (e.g., "orange" → "door hinge").
- Suggestions for connecting lines into verses/choruses.
- Genre-aware prompts so the assistant can distinguish pop, country, battle rap, club rap, and other styles.

### Export
- Free tier: view only.
- Paid tier: export notebook as PDF/Doc and audio mix (lyrics + beat) as MP3.

### Auth & Paywall
- Free plan: limited pages and beats.
- Paid plan ($5–10/mo): unlimited pages, exports, full song creation.

## Suggested Tech Stack

### Frontend
- Next.js and Tailwind CSS for web.
- React Native or Flutter for future mobile apps.

### Backend
- Firebase (Auth, Firestore, Storage, paywall gating).
- Optional Node.js/Express API for model orchestration.

### AI Integration
- MusicGen via Hugging Face Inference API or Riffusion via Replicate.
- Small LLM or rule-based service for rhyme and cadence suggestions.

### Export
- PDFs with pdfkit or Firebase Functions.
- Audio mixing using FFmpeg (Cloud Run job).

## Monetization
- Free tier: ~3–5 pages, short beat loops, no downloads.
- Pro tier ($5–10/mo): unlimited pages, full song creation, exports.
- Future Studio tier: collaboration, contests, cloud storage.

## Success Criteria (MVP)
A user can:
1. Sign up and log in.
2. Write bars into a notebook page.
3. Generate and play an AI beat.
4. Receive basic rhyme and cadence suggestions.
5. Hit a paywall after ~3–5 pages.
6. Export notebook and audio when subscribed.

## Stretch Goals (Post-MVP)
- Collaborative notebooks.
- Social sharing of bars and beat snippets.
- Custom beat parameters (BPM, instruments).
- Gamified practice challenges.

