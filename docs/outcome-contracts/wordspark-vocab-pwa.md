# Outcome Contract — WordSpark Vocabulary PWA

## Job
Help students (up to 12th standard) master 1000 advanced English words in 100 days through daily reading passages and shareable certificates parents can see on WhatsApp.

## North Star
A kid completes Day 1 reading, shares a certificate image on mobile, and parent sees 10 learned words + takeaways — all offline-capable PWA.

## Key Results
1. PWA installable on mobile/tablet (manifest + service worker)
2. 1000 words across 100 days (10 words/day) with meanings
3. Daily passage embeds each word ~10 times for natural repetition
4. Certificate image generated client-side with words + takeaways
5. WhatsApp share via Web Share API or download
6. Progress persisted in localStorage

## Kill Experiment
If passage generation cannot naturally repeat 10 words × 10 times in readable prose, pre-write template passages per theme.

## Boundary
Client-side only. No backend. No auth. Static hosting.

## Definition of Done
- [x] App loads and shows today's passage
- [x] Highlighted vocabulary words in passage
- [x] Certificate generates as PNG with 10 words + takeaways
- [x] Share/download works on mobile
- [x] PWA manifest + service worker for offline
- [x] 100 days × 10 words dataset complete
