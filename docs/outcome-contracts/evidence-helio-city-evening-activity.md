# Evidence — Helio City evening activity

**Contract:** [`docs/outcome-contracts/helio-city-evening-activity.md`](../outcome-contracts/helio-city-evening-activity.md)  
**Playbook:** [`docs/research/helio-city-evening-activity.md`](../research/helio-city-evening-activity.md)  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-13  
**Status:** not yet

Graded against the contract + playbook only. Plan was not rewritten. No product code edited.

Live fetches this eval (13 Sep 2026): Aptner contacts, Namuwiki (via search dump), Woondoc, Songpa Gongdan, Finance Today, PMC6190726, ACSM/PMC8802999, ADA exercise page, purpleo licensing mirrors, SFRC/Seoul English pages, MOJ 1345.

## Verdict: **not yet**

Kill criteria are **not** hit. Contacts in the playbook are **not invented**. The recommended on-site path is justified vs commute classes. The slice is blocked by **KR2**: no Gmail message ids and no calendar event in the artifacts.

## Outcome Frame (from contract)

- **Job:** Replace post-6pm Instagram sitting with a walkable 90–120 min ritual a Helio City *resident* can start this week.
- **North Star:** ≥5 on-site evenings in 14 days; proxy = calendar 18:30–20:30 Asia/Seoul + sourced playbook.
- **Kill:** non-resident → not Sports Zone; English-instructor-every-session + refuse Korean desk → kill GX/TKD; 45-day lock-in before 14-day trial → kill.

## Key Results

| KR | Result | Why |
|----|--------|-----|
| **KR1** One path beats commute on distance, cost, dropout — sourced contacts | **pass** | Walk vs fare is true; wiki fees ₩10–20k/facility/month vs class + transit; lock-in/dropout matches user constraints; desk phones match Aptner. |
| **KR2** Inquiry email from `youtextme@gmail.com` to English desk + Aptner; 14-day calendar trial | **fail** | Scripts exist. Repo grep finds **no** message ids, **no** `.ics` / calendar receipt, **no** sent-mail artifact. |
| **KR3** English constraint honest; on-site English instruction `[unverified]`, not a blocker | **pass** | Playbook does **not** claim English instructors on site. Visual sports + SFRC for first Korean calls. |
| **KR4** Diabetes-safe timing; medical claims cited, not invented | **pass** (minor overclaim, see below) | Post-dinner 20 min walk cited; ADA hypo caveats cited; “not medical advice” present. |

North Star proxy: playbook exists; **calendar block does not.** Human 48h on-site check is future-dated (Mon 14 Sep 2026) — not graded as done.

---

## 1. Contacts vs cited sources — invented?

**None of the listed phones/emails appear invented.** Spot-check:

| Claim | Source this eval | Present? |
|-------|------------------|----------|
| Community desk **070-7772-5473** | [Aptner 연락처정보](https://heliocity.aptner.com/v2/page/menu/10789) “커뮤니티 운영사무실” | **yes** |
| Blue gym **070-7714-3036** | same page “블루짐 안내데스크” | **yes** |
| Red gym **070-8890-0123** | same “레드짐 안내데스크” | **yes** |
| Golf **070-7772-5472** | same “골프장 안내데스크” | **yes** |
| Main office **02-403-8330** | same “총괄센터 대표번호” | **yes** |
| Aptner **help@aptner.com** · **1600-3123** | same “서비스문의” / “문의” | **yes** (platform vendor, not Sports Zone staff) |
| Helio First TKD **02-430-4562**, A-dong 3F 43/44/46 | [purpleo 체육도장 인허가](https://fgy.purpleo.co.kr/view/2388) (영업중, 2024-09-11 dump); Onkorea has the **address** but phone “미등록” | **phone yes on licensing aggregator** |
| Helio GYM **02-423-0731**, B-dong 2F #92 | [purpleo 체력단련장](https://ffc.purpleo.co.kr/view/5824) + Naver blog URL | **yes** |
| SFRC English **02-2229-4912**, help@ / hotline@sfrc.seoul.kr | [chingune listing](https://www.chingune.or.kr/bbs/board.php?bo_table=B11); [english.seoul.go.kr](https://english.seoul.go.kr/seoul-offers-lease-counseling-in-seven-languages-to-protect-international-residents-from-jeonse-fraud-in-small-apartments-villas/); [global.seoul.go.kr](https://global.seoul.go.kr/) footer Email hotline@ | **yes** |
| HiKorea **1345**, weekdays to 22:00 English | [MOJ Immigration Contact Center](https://www.moj.go.kr/immigration_eng/1862/subview.do) | **yes** |
| Songpa badminton 문정로 176, weekday **₩2,500**, month **₩43,000**, 18:30–21:30 | [songpagongdan sports02](https://www.songpagongdan.or.kr/sports/sports02.asp) | **yes** (weekend day fee is ₩3,200, not stated) |
| Hours 06:00–23:00 / weekend 09:00–21:00 / **Monday closed** | [Woondoc 15420](https://www.woondoc.com/centerdetail/15420) | **yes on aggregator**; playbook correctly says confirm |
| Resident-only gym/pool/TT/badminton; ~₩10–20k/mo | Namuwiki: “단지 거주민만 이용가능… 항목별 월 1~2만 원” | **yes, wiki** |
| Historical swim-lesson stack ~₩21만 | [Finance Today 2020](https://www.fntoday.co.kr/news/articleView.html?idxno=224387) | **yes** (2020 complaint, not current tariff) |

Playbook cites “licensing data for studios” without a URL. Independent licensing mirrors still contain the TKD/GYM numbers. **No fabricated desk numbers.**

Nuance (not invention): `help@aptner.com` is **Aptner Inc. 서비스문의**, not the community sports office. Emailing it will not register a gym pass.

---

## 2. English-speaking instructors on site — over-claim?

**No over-claim of on-site English instructors.**

Playbook: “English-only instructor every night — Unlikely on-site `[unverified]`.” KR3 language is followed. Scripts *ask* SFRC/TKD whether anyone speaks English; that is inquiry, not a fact.

Soft over-claim (service, not instructor): heading **“English-speaking humans who can call for you”** treats SFRC as a gym-booking secretary. Documented SFRC work is multilingual counseling (and 1345 three-way interp for *public* offices). **Whether SFRC will cold-call 070-7772-5473 is `[unverified]`.** 1345 is correctly labeled “not for gym booking.”

---

## 3. “Do not commute to 45-day Zumba/BJJ” vs contract constraints

**Justified.** Contract kill: lock-in before a 14-day walk-in trial. Assumptions: commute pay, commitment, language. User job is walkable, start this week, no month-long class, zero daily fare.

Commute Zumba/BJJ/TKD fails distance, fare, lock-in, and (for BJJ) Korean instruction. Songpa Gongdan is a real cheap public backup but **not walkable** from 345 Songpa-daero — correctly ranked backup. On-site GX is “ask the desk,” not assumed to exist as English Zumba.

---

## 4. Kill: would a non-resident be wrongly told to use Sports Zone?

**No — kill not triggered**, with one drafting gap.

- Title: plan **for a Helio City resident**.
- Map: **“Resident-only. Bring ID / 입주민 카드.”** Namuwiki agrees (단지 거주민만).
- Helio GYM (B-dong) and Gongdan courts are named, matching the contract fallback.

A reader who ignores “resident” and jumps the one-sentence decision (“use the on-site Sports Zone you already live in”) could still walk to the desk and be turned away. The playbook does **not** put the contract’s non-resident fork in the first screen (“if you are not a household resident → Helio GYM or Gongdan, not Sports Zone”). That is a clarity miss, not a false open-access claim.

---

## 5. Medical claims — cited vs over-claimed?

| Playbook claim | Source | Grade |
|----------------|--------|-------|
| 20 min post-dinner walk reduces PPG spike in T2D | [PMC6190726](https://pmc.ncbi.nlm.nih.gov/articles/PMC6190726/) (n=29 Chinese T2D; 20 min treadmill, 40% HRR) | **cited, slightly over-claimed:** study **excluded insulin users**; “cuts glucose spike” is stronger than “reduced 2-h spike / AUC.” No nocturnal hypo *in that protocol*. |
| ≥150 min/week moderate; break sitting | [PMC8802999](https://pmc.ncbi.nlm.nih.gov/articles/PMC8802999/) ACSM 2022 (150–300 min; interrupt sitting) | **cited.** ADA explainer linked is more BG/hypo than sitting-breaks; sitting-break is ACSM, not that ADA URL. |
| Resistance 2–3×/week (labeled ADA) | ADA position + ACSM table: resistance 2–3 d/wk | **cited** (ACSM page more than the ADA URL used). |
| Long hard night sessions → delayed hypo if insulin / sulfonylureas | [ADA BG & exercise](https://diabetes.org/health-wellness/fitness/blood-glucose-and-exercise): insulin/secretagogues; long/strenuous; lows during **or long after** | **cited, not invented.** “Not medical advice” present. |
| Do not do 2 h combat every night (dropout + hypo) | dropout = judgment; hypo if insulin/secretagogue + strenuous = ADA | **OK as plan, not as RCT.** |

No invented clinical trials.

---

## Unverified or false claims

**False / inaccurate**

- SFRC English hours **Mon–Fri 09:00–18:00**. Independent listing: English **10:00–18:00** Mon–Fri and Sunday (`02-2229-4912`). Sunday window is OK; weekday start is **wrong by ~1 hour**.

**[unverified]** (playbook already tags some)

- On-site English-first instruction (correctly tagged).
- SFRC will place outbound calls to private gyms / TKD.
- Aptner email reaches the Sports Zone desk (vendor vs 단지).
- **2026** month fees still ₩10–20k (wiki; playbook says confirm) and Monday still closed (one aggregator).
- Face-scan still required (last narrative source: Finance Today **2020**).
- Adult evening TKD at A-dong (correctly “if they run adults”).
- English BJJ exists in Songdo and not Songpa (not re-verified this eval).
- GX/Zumba timetable exists on-site tonight (playbook says ask).

**Missing (KR2 / verification), not false**

- Inquiry emails from `youtextme@gmail.com` → SFRC and Aptner (no message ids).
- 14-day calendar trial 18:30–20:30 Asia/Seoul.

---

## Recommended path vs commute classes (one paragraph)

For a **household resident** who hates daily fares, hates 45-day lock-in, and does not need an English instructor every session, the playbook’s spine — post-dinner 20-minute walk, then table tennis / badminton / easy swim on the complex, month-to-month desk access — is **better than commuting to Zumba/BJJ/TKD**. Distance is walk vs transit; cash is wiki-level 단지 fees vs class + fare; dropout risk is play vs a paid streak; language is visual sport plus a Korean desk, which the contract already treats as acceptable. Commute classes only win if the user *requires* English-led instruction every night **and** refuses any Korean desk — that is a **pre-registered kill** of the GX/TKD class path, not a reason to buy a 45-day off-site membership. Helio GYM (B-dong) and Gongdan badminton remain the correct fallbacks if residency fails or courts are packed. **Do not execute KR1 as “proven life change” until KR2 receipts exist and the desk confirms hours/fees in person.**

## Command evidence (Evaluator)

```
$ curl -sS "https://heliocity.aptner.com/v2/page/menu/10789"
# 070-7772-5473, 070-7714-3036, 070-8890-0123, 070-7772-5472, 02-403-8330,
# 1600-3123, help@aptner.com — all present

$ # Woondoc 15420: weekday 06:00–23:00, Sat/Sun 09:00–21:00, 휴무일 매주 월요일
$ # Gongdan sports02: 문정로 176, 평일 2500, 월회원 43000, 4회 18:30–21:30
$ # purpleo 2388: 헬리오 퍼스트 태권도, A동 3층 43,44,46, 전화 02-430-4562 (search dump)
$ # purpleo 5824: 헬리오 GYM, B동 2층 92, 02-423-0731
$ rg -n "youtextme@gmail.com|message.?id" docs/research docs/outcome-contracts
# only the SFRC script line — no sent-mail ids
```

Builder: keep contract **Status: active**. Copy this file’s verdict after KR2 receipts (Gmail ids + calendar) land; then re-eval. Do not mark **proven** on playbook quality alone.
