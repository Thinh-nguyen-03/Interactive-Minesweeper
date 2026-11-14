# C69: Master timeline of money events and government actions

**Verdict: partly-accurate (confidence: medium).** The brief asked for new money-to-official-act proximities. We found a handful that the individual reports had not paired. All of them are timing proximity only (`inferred`), and no source asserts a link for any of them. Most of the tightest pairs in the dataset had already been connected by earlier reports. Several new pairs have a documented innocent explanation, and some cut against a favour reading. **Nothing here shows causation, and this report does not claim it.**

## Method

1. A script (kept outside the repo) loaded all 81 `data/claims/*.json` files. It extracted every dated relationship, plus every dated sentence in sub-claim findings (ISO dates, "Mar 27, 2025", "27 March 2025"). It then sorted each event into one of two kinds:
   - **money**: a payment, investment, purchase, donation, licence fee or settlement flowing to a Trump-family-linked entity or associate (WLF, TMTG, Trump Organization, DT Marks entities, the library foundation, the ballroom, MAGA Inc., inaugural committees and so on);
   - **official**: an act by a US government body or Trump-administration official (dismissal, pardon, approval, licence, charter, contract, loan, appointment, executive order, sale, waiver).
2. Counterparties were normalised by entity id. They were expanded one hop through ownership edges (parent/owner and subsidiary) and through a manual sovereign map: MGX, G42 and Aryam to the UAE; QIA and Qatari Diar to Qatar; PIF, LIV and Humain to Saudi Arabia.
3. Result: **489 events** (397 from edges, 92 from text) and **51 candidate pairs** within 45 days, 47 of them across claim files. A check for whether both dates appear in one report showed 47 of the 51 were already discussed together. The 4 left over were artefacts: a settlement paired with itself, a court scheduling order, and duplicate pardon dates. Other artefacts discarded by hand: ADGM's statement on Aqua 1 (not a US act, not a favour), Cantor's TMTG advisory role paired with an EXIM letter to Critical Metals (wrong money direction), and Trump's OGE disclosure paired with DOJ's Paramount clearance (a disclosure is not a payment).
4. The automated pass mostly re-found known pairs, so we cross-referenced by hand. The main gap was that no report had dated the **October 2025 ballroom donor list** against federal actions. We then used about 20 searches to verify dates for 13 pairs.

The master timeline below has **272 events**: 253 from claim edges, collapsed across duplicates, plus 19 verified additions. (It had 277 before the Nov 2026 audit merged duplicate Milton, CZ and Nvidia rows; see the audit section.) It is saved as `data/timeline.json`. Grades are a heuristic: `single-source` where the edge label cites one outlet, a leak or anonymous sourcing, `inferred` where the label says so, and `documented` otherwise. Month-precision dates are shown as YYYY-MM.

## 1. Proximity pairs not connected by the individual reports (all `inferred`)

| # | Money / benefit side | Official side | Gap | Grade | Section |
|---|---|---|---|---|---|
| A | Microsoft named ballroom donor at the 15 Oct 2025 dinner, list published 23 Oct ($10M per WaPo) | Commerce approves Microsoft's UAE Nvidia-chip licences, **Sep 2025** (disclosed 3 Nov) | ~15-44 days (licence first) | inferred | pair |
| B | Lockheed Martin named ballroom donor ($10M per WaPo) | F-35 Lot 18-19 $12.5B definitized **29 Sep 2025**; Saudi F-35 sale announced **18 Nov 2025** | 16 days before / 34 days after the dinner | inferred | innocent explanation |
| C | YouTube pays $22M to the ballroom in a settlement, **29 Sep 2025** | GSA OneGov "Gemini for Government", **21-22 Aug 2025** | 39 days (act first) | inferred | innocent explanation |
| D | Pakistan's government signs USD1 MoU with SC Financial (USD1 brand co-owner), signed by Zach Witkoff, **14 Jan 2026** | US EXIM $1.25B Reko Diq financing, approval reported **28 Nov**, announced **10 Dec 2025** | 35-47 days (act first) | inferred | pair |
| E | PIF-funded LIV Golf New York at Trump Bedminster, **6-9 Aug 2026** | EA buyout (PIF ~93.4%, Affinity ~1.1%) has all sign-offs incl. reported CFIUS clearance by **30 Jul**, closes 4 Aug; US-Saudi 123 agreement signed **22 Jul 2026** | 7 days / 15 days | inferred | innocent explanation |
| F | Affinity's reported $5B+ solicitation incl. QIA (NYT, **Mar 2026**) | $4.01B Patriot sale to Qatar under emergency waiver, **1 May 2026** | ~30-60 days | inferred | innocent explanation |
| G | Ripple named ballroom donor, 23 Oct 2025 | OCC conditional trust charter, **12 Dec 2025** | 50 days (just outside) | inferred | near-miss / innocent |
| H | Palantir named ballroom donor ($10M per WaPo) | Navy ShipOS, up to $448M, **9 Dec 2025** | 47 days (just outside) | inferred | near-miss |

**What each side says.**
- **A, Microsoft.** Brad Smith says the licences followed stricter safeguards. G42, in which Microsoft has a stake, waited until 19 Nov 2025. We found no statement from Microsoft or the White House linking the licence to the ballroom. The exact day of the licence and the date of the gift are not public.
- **D, Pakistan.** WLF says it is not paid under the Pakistan MoU (C70). The EXIM release frames the loan as support for up to $2B of US equipment exports for a Barrick-led mine. C72 lists both events but does not pair them.
- **E, PIF/Bedminster.** CFIUS decisions are confidential, and the clearance is press-reported only. The LIV host fee is undisclosed.
- **B, C, F, G.** The explanations are in section 3.

## 2. Tight pairs re-verified but already connected in earlier reports

Listed for completeness. These are the closest pairs in the dataset. Fresh searches confirmed the dates.
- **Justin Sun:** $45M WLFI purchase (20 Jan 2025), then a joint SEC stay request **37 days** later (26 Feb 2025). C05, C67. Confirmed by The Block and Cointelegraph.
- **Gemini / Winklevoss:** CFTC joint motion to vacate the consent order (27-28 May 2026), then twin BTC gifts of more than $5M each to MAGA Inc. **22-23 days** later (19 Jun 2026). C43, C52. Judge Hellerstein denied the motion on 16 Oct 2026.
- **Nvidia:** $25M anonymous ballroom commitment dated Oct 2025 (WaPo, single-source; the link is `inferred`), then Commerce approvals of Nvidia-chip sales to G42 and Humain (19 Nov 2025) and Trump's H200-to-China decision (8 Dec 2025). C68.
- **Binance:** CZ pardon (signed 22 Oct, announced 23 Oct 2025), then BUSD-to-USD1 reserve switch **49-50 days** later (11 Dec 2025). The sequence is documented; the link is `inferred`. C10. Decrypt reported it as "following founder's pardon", and Binance denies a connection.
- **Others found by the script and already paired:**
  - Crypto.com Truth.Fi ETF deal (24 Mar 2025) and SEC closing its probe (27 Mar, **3 days**). C22.
  - MGX settles $2B in USD1 (1 May 2025), then the UAE chip framework (15 May, **14 days**) and the SEC's Binance dismissal (29 May, **28 days**). C07, C08, C09.
  - Paramount settlement (2 Jul 2025) and FCC Skydance approval (24 Jul, **22 days**). C33.
  - Coinbase's $1M inaugural gift and SEC dismissal (27 Feb 2025). C23.
  - Robinhood's $2M gift and SEC closure (21 Feb 2025). C43.
  - Qatari Diar Simaisma deal (30 Apr 2025) and Qatar jet acceptance (21 May). C16, C73.
  - Cantor's USA Rare Earth PIPE and Commerce LOI (26 Jan 2026, **same day**). C60.
  - Hung Yen approval (May 2025) and the Vietnam tariff deal (2 Jul 2025). C59.

## 3. Proximities that look suspicious but have a documented innocent explanation

- **Lockheed F-35 (B).** The $12.5B modification of 29 Sep 2025 finalized a handshake deal announced on 25 Nov 2024, under the previous administration. It had to be signed before the 30 Sep fiscal-year end. Lockheed has a large contract action in almost any 45-day window. The Saudi F-35 request long predates the donor list (C56), and the sale was only notified to Congress on 17 Sep 2026.
- **Google OneGov (C).** OneGov is a price concession *to* the government ($0.47 per agency). GSA struck parallel deals with OpenAI, Anthropic, Microsoft (2 Sep 2025, about $3.1B of first-year savings) and AWS. The YouTube settlement ended a suit Trump filed in 2021.
- **EA/CFIUS and LIV Bedminster (E).** LIV announced the Bedminster date on 23 Jan 2026, six months before the CFIUS outcome. PIF said on 30 Apr 2026 that it would stop funding LIV after 2026.
- **Qatar Patriot (F).** The same emergency determination covered Kuwait ($2.5B), Israel and the UAE. A March 2026 waiver covered about $16.5B for the UAE, Jordan and Kuwait. These were replenishment sales after Iranian strikes, and the same relief went to states with no reported Affinity solicitation.
- **Ripple OCC charter (G).** Ripple was one of five conditional charters issued the same day, with Circle, Paxos, Fidelity Digital Assets and BitGo. Most of the others were not ballroom donors.
- **Microsoft (A), partly.** The same month, Microsoft gave GSA a multibillion-dollar discount. The licence also followed Biden-era licences to the same company (C08).

## 4. Cases where timing cuts against a favour reading

- **Amazon:** the official act nearest its listing as a ballroom donor was a **$2.5B FTC penalty** (25 Sep 2025, 20-28 days earlier), not relief (C44).
- **Charles Ergen / EchoStar:** he committed $12.5M in Dec 2025 and $12.5M in Feb 2026 (WaPo, single-source). The FCC approval came 85-160 days later (12 May 2026), outside the window, and imposed a $2.4B escrow condition that EchoStar called "unprecedented".
- **Microsoft:** on 26 Sep 2025, between the licence and the dinner, Trump publicly demanded that Microsoft fire Lisa Monaco (C68).
- **Gemini:** the CFTC motion came *before* the twins' gifts, and a court refused the relief (16 Oct 2026).
- **Justin Sun:** the stay came 37 days after his purchase, but dismissal took another year and Rainberry paid $10M (C05).
- **G42:** it waited about six months after MGX's May 2025 USD1 deal for its own licences (C08).
- **Indonesia:** Jakarta halted the Trump-linked Lido project (6 Feb 2025) during the tariff talks (C59).

## Not connected in the coverage we found

These links are our own cross-referencing. No outlet we found pairs them.
- Microsoft's Sep 2025 UAE licences and its ballroom donation (`inferred`).
- Lockheed's 29 Sep 2025 F-35 contract and its ballroom donation, 16 days later at the dinner (`inferred`; innocent explanation documented).
- Google's OneGov deal (Aug 2025) and the YouTube ballroom settlement 39 days later (`inferred`; innocent explanation documented).
- EXIM's Reko Diq financing and Pakistan's USD1 MoU with SC Financial 35-47 days later (`inferred`).
- CFIUS/EA clearance (by 30 Jul 2026) and LIV Bedminster (6-9 Aug 2026) (`inferred`; schedule fixed in advance).
- Ripple's and Palantir's approvals 47-50 days after the donor list (`inferred` near-misses).
- Ergen's ballroom commitment and the FCC EchoStar order (`inferred`; timing cuts against).

## Caveats

- For most ballroom donors only the list date (23 Oct 2025) and the dinner (15 Oct 2025) are public. The gifts themselves may have been earlier or later, so gaps for those pairs are measured from the list.
- The 45-day window is arbitrary, and large firms have federal actions in almost any window. Proximity among frequent contractors is weak evidence.
- Timeline grades come from a heuristic over edge labels. Each event's own claim file holds the authoritative grading and sources.

## Sources

1. CNBC, Microsoft UAE chip licences, 2025-11-03. https://www.cnbc.com/2025/11/03/nvidia-shares-rise-after-us-approves-chip-sales-to-the-uae.html
2. DCD, Microsoft first UAE export licence, 2025-11-03. https://www.datacenterdynamics.com/en/news/microsoft-becomes-first-company-granted-export-license-by-us-govt-to-ship-nvidia-gpus-to-uae/
3. CNBC, ballroom donors, 2025-10-23. https://www.cnbc.com/2025/10/23/trump-white-house-east-wing-ballroom-donors-apple-amazon-meta-microsoft-google.html
4. NBC News, ballroom donor list, 2025-10-23. https://www.nbcnews.com/politics/white-house/list-donors-trump-new-white-house-ballroom-east-wing-rcna239481
5. The Hill, WaPo ballroom amounts, 2026-10-15. https://thehill.com/homenews/administration/6152301-white-house-ballroom-private-donations/amp/
6. Defense News, F-35 Lots 18-19 contract, 2025-09-30. https://www.defensenews.com/air/2025/09/30/pentagon-awards-contract-for-newest-f-35s/
7. Breaking Defense, F-35 deal finalized, 2025-09-29. https://breakingdefense.com/2025/09/lockheed-pentagon-finalize-deal-for-296-f-35s/
8. Defense News, F-35 handshake deal, 2024-11-25. https://defensenews.com/air/2024/11/25/pentagon-lockheed-reach-handshake-deal-for-next-f-35s
9. Nextgov, GSA-Google Gemini agreement, 2025-08. https://www.nextgov.com/acquisition/2025/08/gsa-google-reach-agreement-gemini-availability-and-pricing/407586/
10. GSA, Microsoft OneGov agreement, 2025-09-02. https://www.gsa.gov/about-us/newsroom/news-releases/multibillion-dollar-gsa-onegov-agreement-with-microsoft-brings-steep-discounts-09022025
11. CBS News, YouTube $22M ballroom settlement, 2025-09-29. https://www.cbsnews.com/news/youtube-settles-trump-lawsuit-white-house-ballroom
12. The Register, Navy-Palantir ShipOS, 2025-12-10. https://www.theregister.com/2025/12/10/palantir_navy_448_million_contract/
13. Business Wire, Navy-Palantir release, 2025-12-10. https://www.businesswire.com/news/home/20251210738739/en/U.S.-Navy-Partners-with-Palantir-to-Modernize-Shipbuilding-Supply-Chain-and-Accelerate-Shipbuilding
14. The Next Web, Nvidia and Apple $25M (WaPo), 2026-10-15. https://thenextweb.com/news/nvidia-apple-25m-trump-ballroom-donors
15. Implicator.ai, leaked ballroom list, 2026-10-15. https://www.implicator.ai/nvidia-and-apple-each-committed-25-million-to-trumps-ballroom-leaked-list-shows/
16. Billionaires.Africa, Ergen $25M ballroom, 2026-10-16. https://www.billionaires.africa/2026/10/16/american-billionaire-charles-ergen-adelsons-each-gave-25-million-for-trumps-ballroom/
17. Advanced Television, FCC approves EchoStar sales, 2026-05-13. https://www.advanced-television.com/2026/05/13/fcc-approves-echostars-spectrum-sale-to-spacex-att/
18. Telecompetitor, FCC EchoStar approval, 2026-05-12. https://www.telecompetitor.com/fcc-approves-att-and-starlink-purchases-of-echostar-spectrum/
19. Dawn, EXIM Reko Diq, 2025-12-10. https://www.dawn.com/news/1960428/us-exim-bank-okays-12bn-for-reko-diq
20. Profit (Pakistan Today), EXIM approves $1.25B, 2025-11-28. https://profit.pakistantoday.com.pk/2025/11/28/us-exim-approves-1-25bn-as-reko-diq-secures-half-of-3-5bn-debt-financing/
21. Arab News Pakistan, EXIM commitment, 2025-12-10. https://www.arabnews.pk/node/2625697
22. Reuters via Yahoo, Pakistan-SC Financial USD1 MoU, 2026-01-14. https://finance.yahoo.com/news/exclusive-pakistan-partner-world-liberty-062318246.html
23. LIV Golf, return to Bedminster announcement, 2026-01-23. https://www.livgolf.com/news/liv-golf-returns-new-york-bedminster-2026-season
24. New England Golf, LIV Bedminster Aug 6-9. https://newengland.golf/liv-golf-returns-to-trump-national-bedminster-august-6-9/
25. LIV Golf, Maaden LIV Golf Virginia title partner, 2026. https://www.livgolf.com/news/maaden-named-title-partner-for-liv-golf-virginia-2026
26. ABC7/AP, EA go-private closes, 2026-08-05. https://abc7news.com/post/video-game-giant-electronic-arts-closes-55-billion-go-private-sale-business/19631707/
27. Tech Insider, EA EU/CFIUS clearance, 2026-08. https://tech-insider.org/ea-buyout-eu-approval-cfius-2026/
28. Dawn (Reuters), $8.6B emergency arms sales, 2026-05. https://www.dawn.com/news/1996915
29. Al-Monitor, March 2026 emergency sales, 2026-03. https://www.al-monitor.com/originals/2026/03/us-fast-tracks-165b-arms-sales-uae-jordan-kuwait-amid-iran-attacks
30. Decrypt, Binance and USD1 after the pardon, 2025-12-11. https://decrypt.co/352035/binance-deepens-ties-trump-backed-stablecoin-following-founders-pardon
31. The Block, SEC and Justin Sun stay, 2025-02-26. https://www.theblock.co/post/343635/sec-and-justin-sun-look-to-explore-a-potential-resolution
32. Cointelegraph, SEC stay request, 2025-02-26. https://cointelegraph.com/news/sec-asks-stay-case-justin-sun-potential-resolution
33. The Block, CFTC joins Gemini motion, 2026-05-28. https://www.theblock.co/news/business/2026-05-28-cftc-joins-relief-motion-gemini-402827
34. The Block, judge denies Gemini-CFTC bid, 2026-10-16. https://theblock.co/news/regulation/2026-10-16-us-judge-denies-joint-gemini-cftc-bid-418775
Audit sources are listed in the audit section below.

Other dates in the timeline come from the cited claim files (column "Claims"). We did not re-verify them here, except where they appear above.

## Audit (second review, Nov 2026)

**Result: upheld** (verdict and confidence unchanged). An independent reviewer re-dated the six most significant pairs with fresh searches through outlets other than those cited above, checked the grading and wording of every pair, and spot-checked more than 20 timeline rows against their claim files.

**Pairs re-verified (dates and gaps upheld):**
- A, Microsoft: approval in September 2025, disclosed 3 Nov 2025 (Implicator, Semafor, UPI). The gap range is corrected from about 14-44 to about 15-44 days.
- B, Lockheed: $12.5B Lot 18-19 modification on 29 Sep 2025 (The Aviationist, Shephard, Air & Space Forces).
- C, Google: GSA announced Gemini for Government on Thursday 21 Aug 2025 (TechRepublic, Ground News). YouTube settled on 29 Sep 2025 (NPR, Al Jazeera).
- D, Pakistan: EXIM approved the $1.25B in late November 2025 after the shutdown delayed board decisions, and announced it on 10 Dec (Geo, Aaj). The MoU was signed on 14 Jan 2026 (ProPakistani, Business Recorder).
- E, PIF: the EU cleared the deal on 23 Jul 2026. EA's 8-K of 30 Jul 2026 says all regulatory approvals were obtained but does not name CFIUS, so the CFIUS clearance stays press-reported. The deal closed at the end of trading on 4 Aug 2026 (9fin, Startup Fortune, AP).
- F, Qatar: the emergency waiver and $4.01B Patriot sale were announced on 1-2 May 2026 (Al Jazeera, Reuters via Profit).

**Grading and wording.** Every pair is graded `inferred`, and we found no causal wording in the findings, the relationship labels or this report. For the Nvidia and Binance pairs, which had been graded only on their dates, the text now says explicitly that the link is inferred.

**Timeline fixes (`data/timeline.json` and the table below):**
- Witkoff $100M (2025-05): the row named an 'Apollo-run trust (partly Qatar-owned)' as the lender. Per the NYT correction recorded in C53 and C73, the lender was Apollo itself. Corrected.
- Justin Sun (2024-11): the row carried the full $75M, but only $30M was bought in Nov 2024. That $30M is a separate 2024-11-25 row, and the $45M top-up is dated 2025-01-20. The amount is blanked to avoid double counting. The underlying C06/C43 edge still dates the $75M to 2024-11.
- Bondi's Apr 2, 2025 TMTG share sale and Gruenbaum's reported Thrive SPV investment were classified as official acts. Both are personal transactions, so they are now classified as money, with a note.
- Duplicates merged: the Milton pardon (27 and 28 Mar 2025) is now one row on 28 Mar, noting that Milton announced it on 27 Mar. The CZ pardon (four rows) is now one row on 23 Oct, noting the 22 Oct signing.
- The five 'committed (WaPo leak)' ballroom rows are dated 2026-10-15. That is the date the leak was published, not the date of the gift, and the titles now say so. The Nvidia row duplicated the 2025-10 Nvidia row and was removed.
- Result: 272 events (108 money, 164 official).
- Rows checked with no change needed: the six pairs above, plus Bondi's appointment (Feb 2025), the jet memo (May 2025), Patel's Doha agreements (Dec 2025), Blanche's 16 Sep 2026 refusal (C76), Quintenz's withdrawal (30 Sep 2025), Ripple's dropped appeal (7 Aug 2025), the Sun stay (26 Feb 2025), the Gemini CFTC motion (27 May 2026) and the Winklevoss gifts (19 Jun 2026).

**Audit sources:**
- Implicator.ai, Microsoft gets a rare U.S. export license for UAE AI chips, 2025-11. https://www.implicator.ai/microsoft-gets-a-rare-u-s-export-license-for-uae-ai-chips/
- Semafor, Microsoft says UAE AI chip approval 'first step' for Emirati access, 2025-11-10. https://www.semafor.com/article/11/10/2025/microsofts-uae-ai-chip-approval-a-first-step-for-emirati-access-executive
- The Aviationist, JPO and Lockheed Martin finalize F-35 contract for Lots 18 and 19, 2025-09-30. https://theaviationist.com/2025/09/30/f-35-contract-lots-18-and-19/
- Shephard Media, Lockheed Martin secures $12.5 billion Lot 18-19 F-35 production contract, 2025-09-30. https://www.shephardmedia.com/news/air-warfare/lockheed-martin-secures-125-billion-lot-18-19-f-35-production-contract/
- TechRepublic, GSA, Google launch Gemini AI program for US government, 2025-08-22. https://www.techrepublic.com/article/news-google-gemini-for-government/
- NPR, YouTube agrees to pay Trump $24 million to settle lawsuit over Jan. 6 suspension, 2025-09-29. https://www.npr.org/2025/09/29/nx-s1-5557371/youtube-trump-lawsuit-settlement
- Geo News, Global lenders secure $3.5bn debt package for Reko Diq, 2025-12. https://www.geo.tv/latest/636072-global-lenders-secure-35bn-debt-package-for-reko-diq
- ProPakistani, Pakistan signs agreement to explore stablecoin USD1 for cross-border payments, 2026-01-14. https://propakistani.pk/2026/01/14/pakistan-signs-agreement-to-explore-stablecoin-usd1-for-cross-border-payments/
- 9fin, Electronic Arts merger sets 4 August close, 2026-07. https://9fin.com/insights/electronic-arts-merger-sets-4-august-close
- Startup Fortune, The EU cleared the Saudi-Kushner buyout of Electronic Arts and now only Washington stands in the way, 2026-07-23. https://startupfortune.com/the-eu-cleared-the-saudi-kushner-buyout-of-electronic-arts-and-now-only-washington-stands-in-the-way/
- Al Jazeera, US approves $8.6bn in arms sales to Middle East allies, 2026-05-03. https://www.aljazeera.com/economy/2026/5/3/us-approves-8-6bn-in-arms-sales-to-middle-east-allies
- Reuters via Profit (Pakistan Today), US bypasses congressional review for military sales of $8.6 billion to Middle East allies, 2026-05-02. https://profit.pakistantoday.com.pk/2026/05/02/us-bypasses-congressional-review-for-military-sales-of-8-6-billion-to-middle-east-allies

## Master timeline (272 events; also in `data/timeline.json`)

| Date | Kind | Event | Parties | Amount (USD) | Claims | Grade |
|---|---|---|---|---|---|---|
| 2017-01 | money | Jay Weitzman donated $25,000 to 2017 inauguration Donald Trump | jay-weitzman, donald-trump | 25,000 | C66 | documented |
| 2018-09 | official | U.S. Securities and Exchange Commission charged over pump-and-dump (2018; settled 2019) Barry Honig | sec, barry-honig |  | C39 | documented |
| 2018-10-29 | official | U.S. Securities and Exchange Commission fraud case dismissed with prejudice Yorkville Advisors | sec, yorkville-advisors |  | C62 | documented |
| 2020-02 | official | Donald Trump pardoned Bernard Kerik | donald-trump, bernard-kerik |  | C73 | documented |
| 2020-12-23 | official | Donald Trump pardoned Charles Kushner | donald-trump, charles-kushner |  | C66 | documented |
| 2021-07 | money | Public Investment Fund (Saudi Arabia) committed $2B to (largest investor) Affinity Partners | saudi-pif, affinity-partners | 2,000,000,000 | C15, C37 | documented |
| 2024-06 | money | Cameron Winklevoss gave ~$1M in BTC (excess refunded) Trump 47 Committee | cameron-winklevoss, trump-47-committee | 1,000,000 | C23 | documented |
| 2024-06 | money | Tyler Winklevoss gave ~$1M in BTC (excess refunded) Trump 47 Committee | tyler-winklevoss, trump-47-committee | 1,000,000 | C23 | documented |
| 2024-07 | money | Yorkville Advisors equity-line buyer, placement agent, ETF adviser Trump Media & Technology Group | yorkville-advisors, trump-media-technology-group |  | C78 | documented |
| 2024-10 | money | Trevor Milton donated (with wife) to Trump-aligned committees Donald Trump | trevor-milton, donald-trump | 1,800,000 | C36, C49 | documented |
| 2024-10 | official | U.S. Securities and Exchange Commission sued as unregistered dealer Cumberland DRW | sec, cumberland-drw |  | C19 | documented |
| 2024-11 | money | Justin Sun bought WLFI tokens from World Liberty Financial: $30M in Nov 2024 (see 2024-11-25), topped up by $45M on 2025-01-20 to $75M total; amount left blank here to avoid double counting | justin-sun, world-liberty-financial |  | C06, C43 | documented |
| 2024-11 | official | US Department of Defense Air Force SBIR award (~$1.8M), start 2024-11-07 Boardwalk Robotics | pentagon, boardwalk-robotics | 1,800,000 | C28 | documented |
| 2024-11 | official | Donald Trump nominated as Commerce Secretary Howard Lutnick | donald-trump, howard-lutnick |  | C35 | documented |
| 2024-11-25 | money | Justin Sun bought $30M of WLFI token | justin-sun, wlfi-token, world-liberty-financial | 30,000,000 | C04, C05 | documented |
| 2024-11-25 | money | HTX (formerly Huobi) on-chain buyer of $30M of WLFI token | htx, wlfi-token | 30,000,000 | C05 | documented |
| 2024-11-30 | official | Donald Trump nominated ambassador to France Charles Kushner | donald-trump, charles-kushner |  | C66 | documented |
| 2024-12 | money | Qatar Investment Authority invested (with Lunate, about $1.5B combined) in Affinity Partners | qatar-investment-authority, affinity-partners |  | C15, C73 | documented |
| 2024-12 | money | Lunate invested (with QIA, about $1.5B combined) in Affinity Partners | lunate, affinity-partners |  | C15, C73 | documented |
| 2024-12 | money | Kraken (Payward) donated $1M to Trump 2025 inaugural committee | kraken, trump-inaugural-committee | 1,000,000 | C23 | documented |
| 2024-12 | money | Ripple donated ~$4.9-5M in XRP to Trump 2025 inaugural committee | ripple, trump-inaugural-committee | 4,900,000 | C23 | documented |
| 2024-12 | money | The Walt Disney Company bid ~$14M (WSJ, unconfirmed) Melania (2026 film) | disney, melania-documentary | 14,000,000 | C44 | single-source |
| 2024-12 | money | Paramount Global bid ~$4M (WSJ, unconfirmed) Melania (2026 film) | paramount, melania-documentary | 4,000,000 | C44 | single-source |
| 2024-12 | money | Amazon donated $1M Trump 2025 inaugural committee | amazon, trump-inaugural-committee | 1,000,000 | C44 | documented |
| 2024-12 | money | ABC News (Disney) settlement paid to (per 2025 disclosure) Trump Presidential Library Foundation | abc-news, trump-presidential-library-foundation | 15,000,000 | C48 | single-source |
| 2024-12 | money | Sam Altman inaugural fund donation Donald Trump | sam-altman, donald-trump | 1,000,000 | C68 | documented |
| 2024-12 | official | Donald Trump named SEC Chair Paul Atkins | donald-trump, paul-atkins |  | C22 | documented |
| 2024-12 | official | Donald Trump appointed AI and crypto czar David Sacks | donald-trump, david-sacks |  | C34 | documented |
| 2024-12-14 | money | ABC News (Disney) agreed to pay $15M (held in escrow) to settle defamation suit Original Trump presidential library fund (Florida, Dec 2024) | abc-news, trump-presidential-library-fund | 15,000,000 | C33 | documented |
| 2024-12-14 | official | Donald Trump named chair of PIAB Devin Nunes | donald-trump, devin-nunes |  | C41 | documented |
| 2024-12-20 | money | Lunate invested (with QIA) $1.5B in Affinity Partners | lunate, affinity-partners | 1,500,000,000 | C57, C67 | documented |
| 2024-12-20 | money | Qatar Investment Authority invested (with Lunate) in Affinity Partners | qatar-investment-authority, affinity-partners |  | C57 | documented |
| 2024-12-20 | official | U.S. Securities and Exchange Commission $123M settlement (pre-term) Tai Mo Shan | sec, tai-mo-shan | 123,000,000 | C67 | documented |
| 2025-01 | money | Aryam Investment 1 upfront payment of about $187M to Trump-family entities Donald Trump | aryam-investment-1, donald-trump, dt-marks-defi-llc, world-liberty-financial | 187,000,000 | C06, C07, C14, C42, C63 | documented |
| 2025-01 | money | Coinbase donated $1M to Trump 2025 inaugural committee | coinbase, trump-inaugural-committee | 1,000,000 | C23 | documented |
| 2025-01 | money | Crypto.com donated $1M to Trump 2025 inaugural committee | crypto-com, trump-inaugural-committee | 1,000,000 | C23 | documented |
| 2025-01 | money | Tahnoon bin Zayed Al Nahyan linked entity bought 49% stake (see C06/C08) World Liberty Financial | tahnoon-bin-zayed, world-liberty-financial |  | C34 | documented |
| 2025-01 | money | Robinhood Markets donated $2M to Trump 2025 inaugural committee | robinhood, trump-inaugural-committee | 2,000,000 | C43 | documented |
| 2025-01 | money | Amazon MGM Studios paid ~$40M to license (reported) Melania (2026 film) | amazon-mgm-studios, melania-documentary | 40,000,000 | C44 | single-source |
| 2025-01 | money | Mohamed Alabbar reported partner in Trump Tower Belgrade (General Staff site) | mohamed-alabbar, trump-tower-belgrade |  | C45 | single-source |
| 2025-01 | money | Justin Sun invested $75M in World Liberty Financial | justin-sun, world-liberty-financial | 75,000,000 | C47 | documented |
| 2025-01 | money | Steve Witkoff co-founder; family entities paid from Aryam deal World Liberty Financial | steve-witkoff, world-liberty-financial |  | C57 | documented |
| 2025-01 | money | Web3Port bought WLFI ($10M announced; ~$20M traced on-chain) World Liberty Financial | web3port, world-liberty-financial | 20,000,000 | C67 | documented |
| 2025-01 | official | Donald Trump appointed special envoy Steve Witkoff | donald-trump, steve-witkoff |  | C76 | documented |
| 2025-01-16 | money | Aryam Investment 1 agreed to pay $500M for 49% of World Liberty Financial | aryam-investment-1, world-liberty-financial | 500,000,000 | C57, C61, C63, C67, C70 | documented |
| 2025-01-20 | money | Tron added $45M WLFI purchase (total $75M) World Liberty Financial | tron, world-liberty-financial | 45,000,000 | C05 | documented |
| 2025-01-20 | money | Justin Sun bought $45M tranche (up to ~$33.75M to DT Marks, inferred) WLFI token | justin-sun, wlfi-token | 45,000,000 | C71 | inferred |
| 2025-01-21 | official | Donald Trump pardoned Ross Ulbricht | donald-trump, ross-ulbricht |  | C36 | documented |
| 2025-01-27 | money | Web3Port announced purchase of 200M WLFI WLFI token | web3port, wlfi-token, world-liberty-financial | 10,000,000 | C71 | documented |
| 2025-01-29 | money | Meta Platforms settled suspension suit for $25M (~$22M to library) Original Trump presidential library fund (Florida, Dec 2024) | donald-trump, meta, trump-presidential-library-fund | 22,000,000 | C33, C68 | documented |
| 2025-02 | money | Oddiyana Ventures strategic investment, undisclosed World Liberty Financial | oddiyana-ventures, world-liberty-financial |  | C67 | documented |
| 2025-02 | money | X Corp settled suspension suit (reported) Donald Trump | x-corp, donald-trump | 10,000,000 | C68 | single-source |
| 2025-02 | official | Donald Trump nominated as Comptroller Jonathan Gould | donald-trump, jonathan-gould |  | C12 | documented |
| 2025-02 | official | Donald Trump appointed Attorney General Pam Bondi | donald-trump, pam-bondi |  | C65 | documented |
| 2025-02 | official | Donald Trump appointed Commerce Secretary Howard Lutnick | donald-trump, howard-lutnick |  | C77 | documented |
| 2025-02-20 | official | Donald Trump named pardon czar Alice Marie Johnson | donald-trump, alice-marie-johnson |  | C49 | documented |
| 2025-02-21 | official | U.S. Securities and Exchange Commission closed crypto investigation with no action Robinhood Markets | sec, robinhood |  | C43 | documented |
| 2025-02-21 | official | U.S. Securities and Exchange Commission closed investigation OpenSea | sec, opensea |  | C43 | documented |
| 2025-02-25 | official | U.S. Securities and Exchange Commission closed investigation with no action Uniswap Labs | sec, uniswap-labs |  | C43 | documented |
| 2025-02-26 | official | U.S. Securities and Exchange Commission jointly sought stay to explore resolution Justin Sun | sec, justin-sun |  | C05, C67 | documented |
| 2025-02-26 | official | U.S. Securities and Exchange Commission closed investigation with no action Gemini | sec, gemini |  | C23, C43 | documented |
| 2025-02-27 | official | U.S. Securities and Exchange Commission dismissed lawsuit with prejudice Coinbase | sec, coinbase |  | C23, C33, C43 | documented |
| 2025-02-27 | official | U.S. Securities and Exchange Commission staff: meme coins generally not securities; no action $TRUMP (Official Trump) | sec, trump-coin |  | C40 | documented |
| 2025-03 | official | Donald Trump pardoned Devon Archer | donald-trump, devon-archer |  | C49 | documented |
| 2025-03 | official | U.S. Securities and Exchange Commission dismissed case Kraken (Payward) | sec, kraken |  | C67 | documented |
| 2025-03 | official | Donald Trump appointed Stephen Feinberg | donald-trump, steve-feinberg |  | C74 | documented |
| 2025-03 | money | Josh Gruenbaum reportedly invested $100,001-$250,000 in Databricks-linked Thrive SPV (single-source, WSJ) Thrive Capital (a personal investment by an official, not an official act) | josh-gruenbaum, thrive-capital |  | C81 | single-source |
| 2025-03-03 | official | U.S. Securities and Exchange Commission closed investigation Yuga Labs | sec, yuga-labs |  | C43 | documented |
| 2025-03-06 | official | Donald Trump signed EO 14233 establishing Strategic Bitcoin Reserve | donald-trump, strategic-bitcoin-reserve, white-house |  | C19 | documented |
| 2025-03-24 | money | Crypto.com ETF partnership for Truth.Fi (non-binding, then binding 2025-04-22) Trump Media & Technology Group | crypto-com, trump-media-technology-group, truth-social-etfs |  | C22, C67 | documented |
| 2025-03-25 | official | U.S. Securities and Exchange Commission closed investigation Immutable | sec, immutable |  | C43 | documented |
| 2025-03-26 | official | US State Department approved possible MQ-9B sale to Qatar | state-department, qatar | 1,960,000,000 | C16 | documented |
| 2025-03-26 | official | US State Department approved MQ-9B sale to Qatar | state-department, mq-9b-sale-qatar | 1,960,000,000 | C73 | documented |
| 2025-03-27 | official | U.S. Securities and Exchange Commission dismissed enforcement case with prejudice Cumberland DRW | sec, cumberland-drw |  | C19, C23, C62, C67 | documented |
| 2025-03-27 | official | U.S. Securities and Exchange Commission closed investigation with no action Crypto.com | sec, crypto-com |  | C22, C23, C43, C52, C62, C67 | documented |
| 2025-03-27 | official | U.S. Securities and Exchange Commission dismissed lawsuit with prejudice Kraken (Payward) | sec, kraken |  | C23, C52, C62 | documented |
| 2025-03-27 | official | U.S. Securities and Exchange Commission dismissed lawsuit Consensys | sec, consensys |  | C23 | documented |
| 2025-03-27 | official | Donald Trump pardoned Arthur Hayes | donald-trump, arthur-hayes |  | C36 | documented |
| 2025-03-27 | official | Donald Trump pardoned Benjamin Delo | donald-trump, benjamin-delo |  | C36 | documented |
| 2025-03-27 | official | Donald Trump pardoned Samuel Reed | donald-trump, samuel-reed |  | C36 | documented |
| 2025-03-27 | official | Donald Trump pardoned Gregory Dwyer | donald-trump, gregory-dwyer |  | C36 | documented |
| 2025-03-27 | official | Donald Trump pardoned operator HDR Global Trading BitMEX (HDR Global Trading) | donald-trump, bitmex |  | C36 | documented |
| 2025-03-28 | official | Donald Trump pardoned Trevor Milton (Milton announced it 27 Mar; White House confirmed 28 Mar 2025) | donald-trump, trevor-milton |  | C36, C49, C61, C64, C65 | documented |
| 2025-03-28 | official | Donald Trump commuted sentence (voiding ~$36M restitution, ~$60M forfeiture) Carlos Watson | donald-trump, carlos-watson | 96,000,000 | C49 | documented |
| 2025-04 | money | Freight Technologies (Fr8Tech) $20M TRUMP treasury plan $TRUMP (Official Trump) | freight-technologies, trump-coin | 20,000,000 | C67 | documented |
| 2025-04 | official | US Department of Defense awarded $45M to Cerebras Systems | pentagon, cerebras | 45,000,000 | C51 | documented |
| 2025-04 | official | Donald Trump appointed senior adviser for Africa/Arab affairs Massad Boulos | donald-trump, massad-boulos |  | C66 | documented |
| 2025-04 | official | ICE ImmigrationOS contract Palantir Technologies (PLTR) | ice, palantir | 30,000,000 | C68 | documented |
| 2025-04 | official | Donald Trump signed April 2025 offshore critical minerals executive order | donald-trump, seabed-mining-eo |  | C77 | documented |
| 2025-04-02 | money | Pam Bondi (then AG) sold $1M-$5M of Trump Media & Technology Group shares on Apr 2, 2025 (a personal transaction by an official, not an official act) | pam-bondi, trump-media-technology-group | 1,000,000 | C65 | documented |
| 2025-04-04 | official | US Department of Defense awarded 7 NSSL missions (~$2.3B) Blue Origin | pentagon, blue-origin | 2,300,000,000 | C44 | documented |
| 2025-04-16 | money | DWF Labs bought $25M WLFI token | dwf-labs, usd1, wlfi-token, world-liberty-financial | 25,000,000 | C62, C67, C71 | documented |
| 2025-04-23 | official | Donald Trump pardoned Paul Walczak | donald-trump, paul-walczak |  | C36, C49 | documented |
| 2025-04-30 | money | Qatari Diar Simaisma golf/villa partner Trump Organization | qatari-diar, trump-organization |  | C67 | documented |
| 2025-05 | money | DRW Investments bought ~4M shares (~$100M) in bitcoin-treasury raise Trump Media & Technology Group | drw-investments, trump-media-technology-group | 100,000,000 | C19, C62, C67 | documented |
| 2025-05 | money | Jane Street bought ~$375M in bitcoin-treasury raise Trump Media & Technology Group | jane-street, trump-media-technology-group | 375,000,000 | C19 | documented |
| 2025-05 | money | Apollo Global Management lent $100M (golf-resort refinancing) to the Witkoff Group; per the NYT correction the lender was Apollo itself, not its Qatar-part-owned trust | apollo-global-management, witkoff-group | 100,000,000 | C53, C73 | documented |
| 2025-05 | money | Cantor Fitzgerald financial adviser on bitcoin-treasury raise Trump Media & Technology Group | cantor-fitzgerald, trump-media-technology-group |  | C62 | documented |
| 2025-05 | money | Yorkville Advisors co-lead placement agent (Yorkville Securities) Trump Media & Technology Group | yorkville-advisors, trump-media-technology-group |  | C62 | documented |
| 2025-05 | money | Clear Street co-lead placement agent on bitcoin raise Trump Media & Technology Group | clear-street, trump-media-technology-group |  | C62 | documented |
| 2025-05 | money | BTIG co-placement agent Trump Media & Technology Group | btig, trump-media-technology-group |  | C62 | documented |
| 2025-05 | money | Cohen & Company Capital Markets co-placement agent Trump Media & Technology Group | cohen-and-company-capital-markets, trump-media-technology-group |  | C62, C78 | documented |
| 2025-05 | money | Addentax Group talks to buy up to $800M of TRUMP and BTC $TRUMP (Official Trump) | addentax, trump-coin |  | C67 | documented |
| 2025-05 | official | US Department of Commerce rescinded AI Diffusion Rule | us-commerce-department, ai-diffusion-rule |  | C08 | documented |
| 2025-05 | official | US Department of Commerce licenses chip exports under UAE AI chips deal | us-commerce-department, uae-chips-deal |  | C35 | documented |
| 2025-05 | official | Pam Bondi signed DOJ memo clearing acceptance of Qatari Boeing 747-8 (Air Force One) | pam-bondi, qatar-jet |  | C61, C65 | documented |
| 2025-05 | official | Pam Bondi reportedly signed DOJ memo on the Qatari jet | pam-bondi, pam-bondi-jet-memo |  | C64, C73 | single-source |
| 2025-05 | official | Donald Trump appointed ambassador to France; pardoned 2020 Charles Kushner | donald-trump, charles-kushner |  | C65 | documented |
| 2025-05-01 | money | MGX used to settle Binance investment USD1 | mgx, usd1 | 2,000,000,000 | C07, C08, C09, C57 | documented |
| 2025-05-08 | official | Donald Trump named pardon attorney Ed Martin | donald-trump, ed-martin |  | C49 | documented |
| 2025-05-13 | money | GD Culture Group announced up to $300M raise to buy BTC and TRUMP $TRUMP (Official Trump) | gd-culture-group, trump-coin | 300,000,000 | C67 | documented |
| 2025-05-15 | official | White House agreed AI Acceleration Partnership / chip framework with United Arab Emirates | white-house, uae |  | C08 | documented |
| 2025-05-27 | money | Clear Street co-lead placement agent on ~$2.44B raise Trump Media & Technology Group | clear-street, trump-media-technology-group |  | C78 | documented |
| 2025-05-27 | money | Yorkville Securities co-lead placement agent on ~$2.44B raise Trump Media & Technology Group | yorkville-securities, trump-media-technology-group |  | C78 | documented |
| 2025-05-29 | money | Jane Street acquired 6.0% via PIPE Trump Media & Technology Group | jane-street, trump-media-technology-group |  | C62 | documented |
| 2025-05-29 | official | U.S. Securities and Exchange Commission dismissed lawsuit with prejudice against Binance | sec, binance |  | C09, C23, C43, C67, C70 | documented |
| 2025-05-29 | official | U.S. Securities and Exchange Commission dismissed lawsuit with prejudice against Changpeng Zhao (CZ) | sec, changpeng-zhao |  | C09, C23 | documented |
| 2025-06 | money | Yorkville America Digital sponsor of Truth Social crypto ETF filings Trump Media & Technology Group | yorkville-america-digital, trump-media-technology-group |  | C62 | documented |
| 2025-06 | money | Aqua 1 Foundation up to $75M of purchase reached Trump-and-sons company (per NYT) Donald Trump | aqua-1-foundation, donald-trump | 75,000,000 | C67 | single-source |
| 2025-06 | official | White House issued AI ethics waiver to David Sacks | white-house, david-sacks |  | C34 | documented |
| 2025-06 | official | Export-Import Bank of the United States letter of interest for up to $120M loan Critical Metals Corp | exim-bank, critical-metals-corp | 120,000,000 | C77 | documented |
| 2025-06-03 | money | Yorkville America Digital sponsor of crypto ETF filings Truth Social ETFs (TSSD, TSNF, TSIC and others) | yorkville-america-digital, truth-social-etfs |  | C78 | documented |
| 2025-06-06 | official | Donald Trump signed EO 14307 'Unleashing American Drone Dominance' | donald-trump, eo-14307 |  | C51 | documented |
| 2025-06-26 | money | Aqua 1 Foundation bought $100M WLFI World Liberty Financial | aqua-1-foundation, world-liberty-financial | 100,000,000 | C67, C71 | documented |
| 2025-06-27 | official | Massad Boulos mediated minerals-for-security deal Democratic Republic of the Congo | massad-boulos, drc |  | C65 | documented |
| 2025-07 | money | Paramount Global settlement paid to Trump Presidential Library Foundation | paramount, trump-presidential-library-foundation | 16,000,000 | C48 | documented |
| 2025-07 | official | Commodity Futures Trading Commission closed earlier probe Polymarket | cftc, doj, polymarket |  | C25 | documented |
| 2025-07 | official | US Department of Defense equity stake and NdPr price floor MP Materials | pentagon, mp-materials |  | C60, C74 | documented |
| 2025-07 | official | US Department of Defense CDAO AI contract (ceiling) xAI | pentagon, xai | 200,000,000 | C68 | documented |
| 2025-07 | official | Donald Trump signed EO 'Accelerating Federal Permitting of Data Center Infrastructure' | donald-trump, data-center-permitting-eo |  | C70 | documented |
| 2025-07-02 | money | Paramount Global settled '60 Minutes' suit for $16M incl. fees, remainder to library Original Trump presidential library fund (Florida, Dec 2024) | donald-trump, paramount, trump-presidential-library-fund | 16,000,000 | C33, C68 | documented |
| 2025-07-02 | official | Donald Trump announced 20% tariff deal US-Vietnam reciprocal trade framework | donald-trump, us-vietnam-trade-framework-2025 |  | C59 | documented |
| 2025-07-09 | money | Justin Sun top holder; pledged $100M buy $TRUMP (Official Trump) | justin-sun, trump-coin | 100,000,000 | C67 | documented |
| 2025-07-10 | official | US Congress Senate confirmed 50-45 Jonathan Gould | us-congress, jonathan-gould |  | C12 | documented |
| 2025-07-15 | official | US Department of Justice closed criminal probe without charges Polymarket | cftc, doj, polymarket |  | C38 | documented |
| 2025-07-15 | official | Donald Trump cut tariff from 32% to 19% in deal with Indonesia | donald-trump, indonesia |  | C59 | documented |
| 2025-07-18 | official | Donald Trump signed into law GENIUS Act | donald-trump, genius-act |  | C34, C35 | documented |
| 2025-07-23 | official | Donald Trump signed EO 'Accelerating Federal Permitting of Data Center Infrastructure' | donald-trump, data-center-permitting-eo |  | C82 | documented |
| 2025-07-24 | official | Federal Communications Commission approved 2-1 with ombudsman/anti-DEI conditions Skydance-Paramount merger | fcc, skydance-paramount-merger |  | C33 | documented |
| 2025-07-24 | official | Federal Communications Commission approved Skydance merger Paramount Global | fcc, paramount |  | C68 | documented |
| 2025-07-31 | official | US Department of Defense Army enterprise agreement (ceiling) Palantir Technologies (PLTR) | pentagon, palantir | 10,000,000,000 | C68 | documented |
| 2025-07-31 | official | Donald Trump 19% tariff and energy/trade deal Pakistan | donald-trump, pakistan |  | C72 | documented |
| 2025-08 | money | Crypto.com CRO-treasury deal partner of Trump Media & Technology Group | crypto-com, trump-media-technology-group |  | C43 | documented |
| 2025-08 | official | General Services Administration OneGov cloud agreement (up to $1B savings) Amazon Web Services | gsa, aws |  | C44 | documented |
| 2025-08-07 | official | U.S. Securities and Exchange Commission dropped appeal; $125M judgment stands Ripple | sec, ripple | 125,035,150 | C23, C33, C43 | documented |
| 2025-08-11 | money | A.G.P./Alliance Global Partners sole placement agent, $1.5B raise ALT5 Sigma (now AI Financial Corporation, AIFC) | agp-alliance-global-partners, alt5-sigma | 1,500,000,000 | C62 | documented |
| 2025-08-21 | official | Office of the Comptroller of the Currency terminated 2022 AML consent order Anchorage Digital | occ, anchorage-digital |  | C62 | documented |
| 2025-08-21 | official | GSA OneGov agreement: Google 'Gemini for Government' at $0.47 per agency (announced Aug 21-22, 2025) | gsa, alphabet |  | C69, C81 | documented |
| 2025-08-25 | money | Yorkville Acquisition Corp SPAC merger partner (terminated) Trump Media Group CRO Strategy | yorkville-acquisition-corp, trump-media-group-cro-strategy |  | C62 | documented |
| 2025-08-26 | money | Crypto.com agreed to buy $50M of common stock in Trump Media & Technology Group | crypto-com, trump-media-group-cro-strategy, trump-media-technology-group | 50,000,000 | C22, C63, C67 | documented |
| 2025-09 | official | US Department of Commerce licensed Nvidia chip transfers to UAE Microsoft | us-commerce-department, microsoft |  | C08, C57 | documented |
| 2025-09 | official | U.S. Securities and Exchange Commission dismissed civil case after pardon Trevor Milton | sec, trevor-milton |  | C49, C61 | documented |
| 2025-09 | official | U.S. Securities and Exchange Commission dismissed civil claims after commutation Carlos Watson | sec, carlos-watson |  | C49 | documented |
| 2025-09 | official | U.S. Securities and Exchange Commission moved to dismiss civil claims Ozy Media | sec, ozy-media |  | C49 | documented |
| 2025-09 | official | U.S. Securities and Exchange Commission dismissed civil case after pardon Devon Archer | sec, devon-archer |  | C49 | documented |
| 2025-09 | official | Commerce approves Microsoft licences to ship ~60,400 A100-equivalent Nvidia chips (incl. GB300) to UAE (disclosed by Brad Smith 2025-11-03) | us-commerce-department, microsoft, uae |  | C08, C69 | documented |
| 2025-09-02 | official | GSA OneGov agreement with Microsoft (est. $3.1B first-year savings to government) | gsa, microsoft |  | C69 | documented |
| 2025-09-05 | money | Justin Sun pledged $10M share purchase (completion unverified) ALT5 Sigma (now AI Financial Corporation, AIFC) | justin-sun, alt5-sigma | 10,000,000 | C67 | documented |
| 2025-09-25 | official | Donald Trump approved divestiture by executive order TikTok USDS Joint Venture LLC | donald-trump, tiktok-usds-joint-venture, white-house |  | C57, C67, C68 | documented |
| 2025-09-25 | official | FTC settlement: Amazon pays $2.5B over Prime practices (penalty, not relief) | ftc, amazon | 2,500,000,000 | C44, C69 | documented |
| 2025-09-29 | money | YouTube/Alphabet settles Trump suspension suit for $24.5M, $22M to the White House ballroom via Trust for the National Mall | alphabet, white-house-ballroom, donald-trump | 22,000,000 | C33, C48, C69 | documented |
| 2025-09-29 | official | Donald Trump signed EO 'Assuring the Security of the State of Qatar' | donald-trump, qatar-security-eo |  | C73 | documented |
| 2025-09-29 | official | Pentagon definitizes F-35 Lots 18-19: $12.5B modification to Lockheed Martin (handshake deal Nov 2024) | pentagon, lockheed-martin | 12,500,000,000 | C69 | documented |
| 2025-09-30 | official | Donald Trump withdrew CFTC chair nomination Brian Quintenz | brian-quintenz, donald-trump, white-house |  | C54, C65 | documented |
| 2025-10 | money | Trust for the National Mall receives and administers donations for White House ballroom | trust-for-the-national-mall, white-house-ballroom |  | C33 | documented |
| 2025-10 | money | Crypto.com gave $20M (two $10M gifts via Foris DAX) in filing period MAGA Inc. | crypto-com, maga-inc | 20,000,000 | C43 | documented |
| 2025-10 | money | Nvidia commits $25M to the White House ballroom, anonymously (dated Oct 2025 per WaPo spreadsheet) | nvidia, white-house-ballroom | 25,000,000 | C68, C69 | single-source |
| 2025-10 | official | Donald Trump nominated as CFTC Chair Mike Selig | donald-trump, mike-selig |  | C22, C54 | documented |
| 2025-10 | official | U.S. Department of Energy ~5% equity stake in loan restructuring Lithium Americas | us-department-of-energy, lithium-americas |  | C60 | documented |
| 2025-10 | official | US International Development Finance Corporation invested in Orion Critical Mineral Consortium | us-dfc, orion-cmc | 600,000,000 | C75 | documented |
| 2025-10 | official | US Department of Defense DPA grant application; equity conversion (~8%) discussed Critical Metals Corp | pentagon, critical-metals-corp | 50,000,000 | C77 | documented |
| 2025-10-10 | official | Pete Hegseth signed letter of acceptance Qatari Emiri Air Force facility, Mountain Home AFB | pete-hegseth, mountain-home-qatari-facility |  | C73 | documented |
| 2025-10-14 | official | US Department of Justice deferred prosecution agreement; about $50M paid to IRS Roger Ver | doj, roger-ver | 49,900,000 | C36 | documented |
| 2025-10-15 | money | East Room dinner for ballroom donors; White House names ~37 donors on 2025-10-23 (incl. Amazon, Apple, Google, Meta, Microsoft, Lockheed Martin, Palantir, Coinbase, Ripple, Tether America, Winklevoss twins); amounts later leaked (Lockheed, Microsoft, Palantir $10M each; Meta, Amazon $5M each) | white-house-ballroom, microsoft, lockheed-martin, amazon, alphabet, meta, palantir, coinbase, ripple, tether |  | C33, C68, C69 | documented |
| 2025-10-15 | official | US Army ordered 3,500 drone motors (value undisclosed) from Unusual Machines | us-army, unusual-machines |  | C32 | documented |
| 2025-10-20 | official | Internal Revenue Service granted tax exemption in 10 days during shutdown Trump Presidential Library Foundation | irs, trump-presidential-library-foundation |  | C48 | documented |
| 2025-10-23 | money | Meteora airdropped about $4.2M of MET to TRUMP-team wallets $TRUMP (Official Trump) | meteora, trump-coin | 4,200,000 | C40 | documented |
| 2025-10-23 | official | Donald Trump pardoned Changpeng Zhao (CZ) (signed 22 Oct, announced by the White House 23 Oct 2025) | changpeng-zhao, donald-trump, white-house, cz-pardon |  | C09, C10, C36, C49, C67, C70 | documented |
| 2025-10-28 | money | Crypto.com prediction-market partner Truth Predict | crypto-com, truth-predict |  | C67 | documented |
| 2025-11 | official | US Department of Commerce licensed ~35,000 Nvidia chips to G42 | g42, us-commerce-department, white-house |  | C08, C34, C67 | documented |
| 2025-11 | official | Office of Strategic Capital $620M loan to Vulcan Elements | office-of-strategic-capital, vulcan-elements | 620,000,000 | C51 | documented |
| 2025-11 | official | Office of Strategic Capital $80M conditional loan (later withdrawn) ReElement Technologies | office-of-strategic-capital, reelement-technologies | 80,000,000 | C60 | documented |
| 2025-11 | official | US Department of Commerce licensed UAE/Saudi chip exports Nvidia | us-commerce-department, nvidia |  | C68 | documented |
| 2025-11-03 | official | Office of Strategic Capital $620M direct loan to Vulcan Elements | office-of-strategic-capital, us-commerce-department, us-department-of-commerce, vulcan-elements | 620,000,000 | C26, C60, C65, C74 | documented |
| 2025-11-03 | official | Office of Strategic Capital $80M conditional loan to (withdrawn Jul 2026) ReElement Technologies | office-of-strategic-capital, reelement-technologies | 80,000,000 | C26 | documented |
| 2025-11-06 | official | Donald Trump struck tungsten deal with Kassym-Jomart Tokayev | donald-trump, kassym-jomart-tokayev |  | C47 | documented |
| 2025-11-06 | official | Donald Trump announced Kazakhstan tungsten deal for Kaz Resources | donald-trump, kaz-resources |  | C60 | documented |
| 2025-11-14 | official | Donald Trump pardoned Joseph Schwartz | donald-trump, joseph-schwartz |  | C49 | documented |
| 2025-11-18 | official | Donald Trump announced approval of Saudi F-35 sale | donald-trump, saudi-f35-sale |  | C56 | documented |
| 2025-11-19 | official | US Department of Commerce approved up to 35,000 GB300-equivalent chips for Humain | us-commerce-department, humain |  | C56 | documented |
| 2025-11-19 | official | US Department of Commerce approved up to 35,000 GB300-equivalent chips for G42 | us-commerce-department, g42 |  | C56 | documented |
| 2025-11-20 | official | US Department of Commerce authorized up to 35,000 GB300-equivalent chips for G42 | us-commerce-department, g42 |  | C57, C70 | documented |
| 2025-12 | money | Gemini donated 1.5M USDC to MAGA Inc. | gemini, maga-inc | 1,500,000 | C43 | documented |
| 2025-12 | money | D. Boral Capital co-lead underwriter of $345M IPO New America Acquisition I Corp | d-boral-capital, new-america-acquisition-i | 345,000,000 | C74 | documented |
| 2025-12 | money | Charles Ergen commits first $12.5M (anonymously) to the ballroom; second $12.5M in Feb 2026 (WaPo spreadsheet) | charles-ergen, white-house-ballroom | 12,500,000 | C69 | single-source |
| 2025-12 | official | Kash Patel signed bilateral security agreements with (as FBI director) Qatar | fbi, kash-patel, qatar |  | C64, C73 | documented |
| 2025-12 | official | Donald Trump said Netflix deal 'could be a problem'; CNN should be sold Warner Bros. Discovery | donald-trump, warner-bros-discovery |  | C68 | documented |
| 2025-12 | official | Kash Patel signed in Doha FBI-Qatar security agreements (Dec 2025) | kash-patel, fbi-qatar-security-agreements |  | C73 | documented |
| 2025-12-05 | money | D. Boral Capital co-lead book-runner of $345M IPO New America Acquisition I Corp | d-boral-capital, new-america-acquisition-i | 345,000,000 | C78 | documented |
| 2025-12-08 | official | Donald Trump allowed H200 China sales with 25% cut to US Nvidia | donald-trump, nvidia |  | C68 | documented |
| 2025-12-09 | official | Navy and Palantir unveil ShipOS, up to $448M over two years | us-navy, palantir | 448,000,000 | C69 | documented |
| 2025-12-10 | official | US EXIM $1.25B financing for Barrick's Reko Diq mine in Pakistan announced (approval reported 2025-11-28) | exim-bank, pakistan, barrick | 1,250,000,000 | C72, C69 | documented |
| 2025-12-11 | money | Binance converts BUSD-backed B-Token reserves into USD1 and adds USD1 pairs | binance, usd1, world-liberty-financial |  | C10, C69 | documented |
| 2025-12-11 | official | Donald Trump signed EO 'Ensuring a National Policy Framework for AI' | donald-trump, ai-preemption-eo |  | C68 | documented |
| 2025-12-12 | official | Office of the Comptroller of the Currency conditionally approved national trust conversion BitGo | occ, bitgo |  | C62 | documented |
| 2025-12-12 | official | Office of the Comptroller of the Currency conditional trust charter Ripple | occ, ripple |  | C62 | documented |
| 2025-12-12 | official | Office of the Comptroller of the Currency conditional trust charter Circle | occ, circle |  | C62 | documented |
| 2025-12-30 | money | Yorkville America Equities investment adviser of Truth Social ETFs (TSSD, TSNF, TSIC and others) | yorkville-america-equities, truth-social-etfs |  | C24, C62 | documented |
| 2026-01 | money | Diriyah Company master-plan host of Trump-branded Wadi Safar project (licensed via Dar Global) Trump Organization | diriyah-company, trump-organization |  | C31 | documented |
| 2026-01 | money | Amazon MGM Studios spent ~$35M marketing (reported) Melania (2026 film) | amazon-mgm-studios, melania-documentary | 35,000,000 | C44 | single-source |
| 2026-01-14 | money | Pakistan government signs USD1 payments MoU with SC Financial Technologies (USD1 brand co-owner); signed by Zach Witkoff | pakistan, sc-financial-technologies, usd1, zach-witkoff |  | C70, C72, C69 | documented |
| 2026-01-23 | money | LIV Golf announces 2026 LIV Golf New York at Trump National Bedminster (Aug 6-9) | liv-golf, trump-national-bedminster, saudi-pif |  | C80, C69 | documented |
| 2026-01-23 | official | U.S. Securities and Exchange Commission stipulated dismissal of Gemini Earn suit Gemini | sec, gemini |  | C23 | documented |
| 2026-01-26 | official | US Department of Commerce $1.6B CHIPS LOI for ~10% stake USA Rare Earth | us-commerce-department, usa-rare-earth | 1,600,000,000 | C60 | documented |
| 2026-02 | official | Donald Trump raised tariffs to 50%, then cut to 18% India | donald-trump, india |  | C59 | documented |
| 2026-02 | official | General Services Administration sole-source order 47QPCA26F0011, ceiling $1,824,000 Databricks | gsa, databricks | 1,824,000 | C81 | documented |
| 2026-02-13 | official | US Treasury issued licence to buy Venezuelan oil (Reuters, anonymous) Reliance Industries | us-treasury, reliance-industries |  | C70 | single-source |
| 2026-02-18 | money | Securitize issuance/compliance partner for Maldives tokens World Liberty Financial | securitize, world-liberty-financial |  | C79 | documented |
| 2026-02-19 | official | Donald Trump named 'envoy of peace' (unofficial, volunteer) Jared Kushner | donald-trump, jared-kushner |  | C15, C45 | documented |
| 2026-02-23 | official | Office of the Comptroller of the Currency granted conditional national trust charter Foris DAX National Trust Bank | occ, foris-dax-national-trust-bank |  | C22, C62, C67 | documented |
| 2026-03 | money | Affinity Partners sought part of $5B+ new raise from (per NYT) Public Investment Fund (Saudi Arabia) | affinity-partners, saudi-pif | 5,000,000,000 | C15 | single-source |
| 2026-03 | money | Jared Kushner sought new capital from (NYT) Qatar Investment Authority | jared-kushner, qatar-investment-authority |  | C73 | single-source |
| 2026-03 | official | U.S. Securities and Exchange Commission dismissed claims; Rainberry paid $10M Justin Sun | sec, justin-sun | 10,000,000 | C52 | documented |
| 2026-03-04 | official | Federal Reserve Bank of Kansas City approved limited master account Kraken Financial | federal-reserve-bank-of-kansas-city, kraken-financial |  | C62 | documented |
| 2026-03-05 | official | U.S. Securities and Exchange Commission dismissed all claims against Justin Sun | sec, justin-sun |  | C05, C43, C67 | documented |
| 2026-03-05 | official | U.S. Securities and Exchange Commission dismissed claims against BitTorrent Foundation Ltd. | sec, bittorrent-foundation |  | C05 | documented |
| 2026-04 | official | US Department of Defense ~$24M in research awards (Army/Navy/Air Force), as promoted Foundation Future Industries | pentagon, foundation-future-industries | 24,000,000 | C28 | documented |
| 2026-04-23 | official | Commodity Futures Trading Commission civil insider-trading complaint (first on event contracts) Gannon Ken Van Dyke | cftc, gannon-van-dyke |  | C58 | documented |
| 2026-04-30 | money | PGA Tour staged $20M Cadillac Championship at Trump National Doral | pga-tour, trump-national-doral | 20,000,000 | C80 | documented |
| 2026-05 | money | Umar Kremlev paid for parts of wedding celebrations (island rental, fireworks); later repaid Donald Trump Jr. | umar-kremlev, donald-trump-jr |  | C76 | documented |
| 2026-05 | money | IB Challenger made wedding payments via Donald Trump Jr. | ib-challenger, donald-trump-jr |  | C76 | documented |
| 2026-05 | official | US State Department approved Patriot replenishment sale to Qatar | state-department, qatar | 4,010,000,000 | C16 | documented |
| 2026-05 | official | Marco Rubio invoked emergency waiver of congressional review for 2026 Qatar Patriot and APKWS sales | marco-rubio, qatar-patriot-apkws-sales-2026, state-department | 5,000,000,000 | C16, C73 | documented |
| 2026-05 | official | Export-Import Bank of the United States advanced ~$2.7-2.9B loan Perpetua Resources | exim-bank, perpetua-resources |  | C60, C77 | documented |
| 2026-05-01 | official | Rubio emergency waiver: $8.6B Mideast arms sales incl. $4.01B Patriot for Qatar, $2.5B Kuwait, APKWS for Israel/UAE | state-department, qatar, kuwait, uae, israel | 8,600,000,000 | C16, C73, C69 | documented |
| 2026-05-07 | money | Maaden LIV Golf Virginia at Trump National Washington DC (May 7-10; PIF-funded host fee undisclosed) | liv-golf, maaden, trump-national-golf-club-dc |  | C80, C69 | documented |
| 2026-05-12 | official | FCC approves EchoStar spectrum sales to AT&T ($23B) and SpaceX ($17B) with a $2.4B escrow condition | fcc, echostar, charles-ergen, spacex | 40,000,000,000 | C69 | documented |
| 2026-05-27 | official | Commodity Futures Trading Commission jointly moved to vacate $5M consent order Gemini | cftc, gemini |  | C52 | documented |
| 2026-06 | official | Federal Communications Commission granted deployment-milestone waiver Amazon Leo (formerly Project Kuiper) | fcc, amazon-leo |  | C44 | documented |
| 2026-06 | official | US Department of Defense no-bid contracts up to ~$350M Alvarez & Marsal Federal | pentagon, alvarez-marsal-federal | 348,700,000 | C65 | documented |
| 2026-06 | official | US Department of Justice cleared Paramount acquisition Warner Bros. Discovery | us-department-of-justice, warner-bros-discovery |  | C68 | documented |
| 2026-06-03 | official | US Department of Commerce definitive CHIPS agreements: $277M funding + $1.3B loan for ~16.1M shares + warrants USA Rare Earth | us-commerce-department, usa-rare-earth | 1,600,000,000 | C77 | documented |
| 2026-06-19 | money | Cameron Winklevoss gave >$5M in BTC to MAGA Inc. | cameron-winklevoss, maga-inc | 5,000,000 | C43, C52 | documented |
| 2026-06-19 | money | Tyler Winklevoss gave >$5M in BTC to MAGA Inc. | tyler-winklevoss, maga-inc | 5,000,000 | C43, C52 | documented |
| 2026-07 | official | Office of Strategic Capital conditional loan to Performance Drone Works | office-of-strategic-capital, performance-drone-works |  | C51 | documented |
| 2026-07 | official | US State Department named chair of Tripp+ fund Konstantin Sokolov | state-department, konstantin-sokolov |  | C70 | documented |
| 2026-07-22 | official | Chris Wright signed US-Saudi 123 civil nuclear agreement | chris-wright, us-saudi-123-agreement |  | C56 | documented |
| 2026-07-30 | official | CFIUS reportedly cleared by 30 Jul 2026 (no public terms) Electronic Arts take-private | cfius, ea-buyout |  | C80 | single-source |
| 2026-07-30 | official | EA buyout (PIF ~93.4%, Silver Lake, Affinity ~1.1%) has all regulatory sign-offs incl. reported CFIUS clearance; closes 2026-08-04 | cfius, ea-buyout, saudi-pif, affinity-partners | 55,000,000,000 | C80, C56, C69 | single-source |
| 2026-07-31 | official | Office of Strategic Capital conditional loan commitment up to $820M Performance Drone Works | office-of-strategic-capital, performance-drone-works | 820,000,000 | C74 | documented |
| 2026-08 | official | US Army Hydra-70 prototype agreement with Firehawk Aerospace | us-army, firehawk-aerospace |  | C32 | documented |
| 2026-08 | official | US Air Force awarded counter-drone IDIQ (ceiling) to Tandem Defense LLC | us-air-force, tandem-defense | 90,000,000 | C51 | documented |
| 2026-08-06 | money | LIV Golf New York played at Trump National Bedminster (Aug 6-9; PIF-funded, host fee undisclosed) | liv-golf, trump-national-bedminster, saudi-pif |  | C80, C69 | documented |
| 2026-08-07 | money | Crypto.com co-sponsor (terminated) Trump Media Group CRO Strategy | crypto-com, trump-media-group-cro-strategy, trump-media-technology-group |  | C41 | documented |
| 2026-08-07 | money | Yorkville Acquisition Corp planned merger partner; terminated Trump Media Group CRO Strategy | yorkville-acquisition-corp, trump-media-group-cro-strategy |  | C63 | documented |
| 2026-08-13 | money | Base Group (Base Co., Ltd.) developer of (Trump-licensed) Trump International Golf Club Korea | base-group, trump-international-golf-club-korea |  | C79 | single-source |
| 2026-08-14 | official | Office of the Comptroller of the Currency granted preliminary conditional approval to World Liberty Trust Company, N.A. | occ, world-liberty-trust-company |  | C12, C42, C57, C63, C67 | documented |
| 2026-08-14 | official | Office of the Comptroller of the Currency conditionally approved trust charter World Liberty Financial | occ, world-liberty-financial |  | C54, C65 | documented |
| 2026-08-14 | official | Office of the Comptroller of the Currency preliminary conditional approval WLTC Holdings LLC | occ, wltc-holdings |  | C62 | documented |
| 2026-08-20 | official | US State Department approved KC-46A sale to Qatar | state-department, qatar-kc46-sale-2026 | 4,500,000,000 | C73 | documented |
| 2026-09-16 | official | Todd Blanche declined to investigate wedding payments to Donald Trump Jr. | todd-blanche, donald-trump-jr |  | C76 | documented |
| 2026-10 | money | Bloomberg LP reportedly subscribes to Truth API | bloomberg-lp, truth-api |  | C41 | single-source |
| 2026-10 | money | Susquehanna International Group reportedly subscribes to Truth API | susquehanna-international-group, trump-media-technology-group, truth-api | 100,000 | C41 | single-source |
| 2026-10 | money | Jump Trading reportedly subscribes to Truth API | jump-trading, trump-media-technology-group, truth-api |  | C41, C62 | single-source |
| 2026-10 | official | US Air Force placed $82M order with Powerus Corp. | us-air-force, powerus | 82,000,000 | C51 | documented |
| 2026-10-15 | money | Meta Platforms committed to the White House ballroom; amount disclosed in the WaPo leak of 2026-10-15 (this is the disclosure date: the gift date is not public, and the donor was named on the 2025-10-23 list) | meta, white-house-ballroom | 5,000,000 | C68 | single-source |
| 2026-10-15 | money | Amazon committed to the White House ballroom; amount disclosed in the WaPo leak of 2026-10-15 (this is the disclosure date: the gift date is not public, and the donor was named on the 2025-10-23 list) | amazon, white-house-ballroom | 5,000,000 | C68 | single-source |
| 2026-10-15 | money | Palantir Technologies (PLTR) committed to the White House ballroom; amount disclosed in the WaPo leak of 2026-10-15 (this is the disclosure date: the gift date is not public, and the donor was named on the 2025-10-23 list) | palantir, white-house-ballroom | 10,000,000 | C68 | single-source |
| 2026-10-15 | money | Microsoft committed to the White House ballroom; amount disclosed in the WaPo leak of 2026-10-15 (this is the disclosure date: the gift date is not public, and the donor was named on the 2025-10-23 list) | microsoft, white-house-ballroom | 10,000,000 | C68 | single-source |
| 2026-10-28 | money | Jump Trading subscriber (Reuters, anonymous sources) Truth API | jump-trading, truth-api |  | C67 | single-source |
| 2026-11 | official | Office of Strategic Capital conditional loan up to $450M to Neros Technologies | office-of-strategic-capital, neros | 450,000,000 | C51 | documented |
| 2026-11-02 | official | Office of Strategic Capital conditional loan commitment up to $450M Neros Technologies | office-of-strategic-capital, neros | 450,000,000 | C74 | documented |
