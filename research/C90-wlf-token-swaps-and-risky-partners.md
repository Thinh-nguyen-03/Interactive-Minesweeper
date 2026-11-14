# C90: World Liberty's token-swap pitch and partners with sanctions or fraud links

**Verdict: mostly-accurate. Confidence: medium.**

*Third-layer connection check from C71, also building on C42 and C67. The original pages at senate.gov, decrypt.co and whbl.com were not read directly, so the findings rest on search results across several outlets plus the primary URLs those results point to.*

## Summary

The swap pitch Blockworks reported is real. It asked a crypto team to buy at least $10M of WLFI at a $1.5B fully diluted valuation (FDV), plus a 10% fee. In return, WLF would buy the same amount of that team's token.

WLF did buy the tokens of nearly every project it partnered with in late 2024 and early 2025. A matching WLFI purchase within days is documented only twice, and in both cases the parties deny that any swap took place:

- **Tron:** TRON DAO bought $45M of WLFI on 2025-01-19. WLF bought about $7M of TRX between 2025-01-20 and 2025-01-23.
- **MOVE:** MOVE's market maker, Web3Port, bought $10M of WLFI on 2025-01-27. WLF bought MOVE on 2025-01-28.

The sanctions and illicit-finance threads are each documented:

- WLF's USD1 deal with AB came four weeks after its resort principals were sanctioned in the Prince Group action.
- A WLFI buyer used A7A5, the ruble stablecoin. This is watchdog-sourced.
- Reuters found Nobitex moved $2.3B or more over Tron and BNB Chain. OFAC then designated Nobitex.
- USD1 runs natively on Tron.

None of these threads shows illicit money reaching WLF or the Trump family. WLF's statement that all buyers passed KYC is its own claim, and no regulator has tested it.

## What was checked, and what the evidence shows

### 1. The swap pitch (DOCUMENTED reporting; underlying message single-source)

- **What Blockworks reported (about 2025-02-03):** It saw a WLF representative's message offering unlaunched WLFI on these terms:
  - a $10M minimum, plus a 10% fee;
  - a $1.5B FDV;
  - first come, first served;
  - closing on a video call with Zak Folkman.
- **Relayed by:** CoinDesk, The Block and crypto.news.
- **Responses:**
  - WLF said it was "not selling tokens" and was "reallocating assets for ordinary business purposes".
  - TRON said "there is no token swap agreement".
  - Movement said it bought no WLFI.
- **Our arithmetic (no source makes this point):**
  - $1.5B across 100B WLFI is $0.015 per token. That was the first-tranche price, while the public price at the time was $0.05.
  - A swap partner would therefore have bought at about 30% of the public price, or about 33% including the fee.
  - Under the Gold Paper, 75% of WLF's net revenue goes to the Trump-family entity DT Marks DEFI (C42). Any fee and token proceeds from swap partners would fall under that split.

### 2. WLF's treasury purchases matched against WLFI purchases by the same project

| Token | WLF purchase (date, size) | Partnership or event | Same project bought WLFI? | Grade |
|---|---|---|---|---|
| ENA | about $500-600K (2024-12-09/12), then about $250K | Ethena proposed sUSDe as collateral on 2024-12-18 | None found. Herro said the purchase was "not directly connected" | Timing documented; no reciprocal purchase |
| ONDO | about $250K (2024-12); about $470K (2025-02-06, the day Ondo's chain launched) | Partnership reported 2025-02-11/12; Ondo's first post was deleted | None found | Timing documented; no reciprocal purchase |
| TRX | about $4.7M (2025-01-20) and about $2.65M more reported (2025-01-23) | Sun's adviser role; later USD1 on Tron | **Yes: TRON DAO bought $45M (2025-01-19)** | Purchases documented; swap inferred and denied |
| MOVE | about $1.85M (2025-01-28), more in Feb-Mar 2025 | Movement mainnet | **Market maker Web3Port bought $10M (2025-01-27)**; Movement itself bought none | Purchases documented; link inferred (C71) |
| SUI | Added to reserve (2025-03-06); no size reported | Sui announced the reserve deal | None found | Partnership documented |
| SEI | about $100K (2025-03-13); about $775K (2025-04-12) | None announced | None found | Purchase documented |
| AVAX, MNT | about $2M each (2025-03-16, Lookonchain) | None announced | None found | Purchase documented |

- **Unidentified buyer:** An anonymous address, 0x848, bought exactly $10M of WLFI on 2025-01-31 (Arkham). That is the swap minimum, but no source names the buyer or ties it to any project. Its significance is INFERRED only.
- **The sale closed the next day:** WLF's token sale closed at $550M on 2025-03-17, one day after the AVAX and MNT buys.

### 3. AB / AB DAO and the Prince Group (DOCUMENTED by three independent investigations)

**The sanctions.** On 2025-10-14, the US and UK sanctioned Prince Group, its founder Chen Zhi and 146 targets. The action included people linked to a Prince-affiliated resort in Palau.

**The people, as reported:**
- The Times (2026-04-06), Guardian Australia/OCCRP (April 2026) and the WSJ (2026-04-28) report that the following people at AB's planned "blockchain theme resort" near Dili, Timor-Leste, were among those sanctioned:
  - Yang Jian, the controlling shareholder of AB Digital Technology Resort;
  - Yang Yanming, its general manager;
  - Shih Ting-yu.
- The Times adds that a co-owner, Chen Zhao, is married to a sanctioned Prince executive, Hu Xiaowei. This is single-source.
- We did not check the SDN entries ourselves.

**The timing.** About four weeks after the sanctions, on 2025-11-12/13, WLF and AB announced that USD1 was deployed on AB Chain, with AB Wallet as its "preferred wallet".

**Responses:**
- AB says it dismissed the three people. Yang Yanming says he was dismissed on 2025-10-16.
- AB's Lin Xiaofan denies any Prince ties, and Prince Group denies any link to AB.
- WLF's lawyers say WLF carried out due diligence, learned of the resort link only in January 2026, and that claims tying it to sanctioned people are "unfounded and untrue".
- No source alleges that Prince money reached AB or WLF.

**Senate letter.** On 2026-05-13/14, Senators Warren and Reed wrote to Bessent and Acting AG Blanche asking for an investigation. They timed it to the CLARITY markup. It is the third of four such letters (2025-11, 2026-02, 2026-05, 2026-09), and no public reply has been found.

### 4. The A7A5 sale (single-source watchdog finding, repeated by senators)

- **The finding:** Accountable.US ("American Sell-Out", September 2025), quoted in the Warren/Reed letter of 2025-11-17, says buyer "0x9009" received more than 10,000 WLFI and also transacted in A7A5. One secondary write-up names "Shryder.eth" instead.
- **What was sanctioned:** On 2025-08-14, OFAC designated A7A5's issuer Old Vector, the A7 entities and Grinex. The token itself is not an SDN entity.
- **Caveats:**
  - Nothing we found says whether the A7A5 use came before or after the WLFI purchase.
  - 10,000 WLFI was worth about $150-500 at sale prices (our arithmetic).
  - Other parts of the same report were rebutted: the "Lazarus" link was a joke airdrop (C71). The A7A5 item itself was not specifically rebutted in what we found.

### 5. Reuters on Nobitex, Tron and BNB Chain (DOCUMENTED)

- **The report:** Tom Wilson and Gavin Finch of Reuters, May 2026 (syndicated copies are dated 2026-05-18). Nobitex moved at least $2.3B since 2023: more than $2B on Tron and about $317M on BNB Chain. Its users included Iran's central bank and the IRGC. Four analysts reviewed the figures and called them sound.
- **No knowledge shown:** Reuters says there is no suggestion the Trump family knew.
- **Responses:**
  - WLF says it has "no relationship with Nobitex" and does not control Tron.
  - Binance says BNB Chain is independent.
  - The White House called the report "totally laughable".
- **Designation:** On 2026-06-02, about two weeks later, OFAC designated Nobitex under E.O. 13224 as part of "Economic Fury". Treasury did not mention WLF.
- **USD1 at Binance:** Reuters also cites Arkham data that Binance holds about $3.8B of USD1.

### 6. USD1 on Tron and Sun's lawsuit (DOCUMENTED)

- **The Tron deal:**
  - Sun, Eric Trump and Zach Witkoff announced it at TOKEN2049 Dubai in May 2025.
  - The first USD1 was minted on Tron on 2025-06-10/11.
  - More than 25M USD1 was on Tron by 2025-08-26.
- **Sun's lawsuit (filed 2026-04-21, N.D. Cal.):** Sun alleges that WLF:
  - pressed him to buy hundreds of millions of dollars of USD1 and promote it on Tron;
  - pressed him to take equity in the WLF holdco;
  - froze his WLFI when he refused, and threatened to report him to criminal authorities. He calls this extortion.
- **WLF's response:** WLF denies the claims and countersued for defamation.
- **Why it matters here:** If proven, the allegations would fit the reciprocal-purchase pattern in the swap pitch. They remain untested.

### 7. WLF's KYC claims (claim DOCUMENTED; effectiveness disputed)

- **What WLF says:**
  - More than 85,000 participants underwent KYC (2025-03-17 release).
  - The checks covered country, wallet, ID and a liveness check (Blockworks).
  - It applies "rigorous AML/KYC".
  - It ran a KYC-gated reallocation of 166.7M WLFI (C42).
- **The gaps in the record:**
  - the AB deal;
  - wallets exposed to A7A5, Nobitex or Tornado Cash;
  - Aqua 1/Zhou and the OKX-funded $100M (C71).
- **Timing:** Most WLFI was sold before the A7A5 issuer designation (August 2025) and the Nobitex designation (June 2026).
- **Our observation:** Identity KYC is not the same as screening a wallet's history.
- **No finding:** No regulator has made a finding on WLF's KYC.

## Not connected in the coverage we found (our own cross-referencing)

| Link | Grade | Note |
|---|---|---|
| Web3Port's $10M WLFI buy as the "payment" side of a MOVE swap | inferred | Exact size match, one day apart. Denied by Movement. |
| Anonymous 0x848's $10M WLFI buy as a swap partner | inferred | Size match only. The buyer is unidentified. |
| WLF's $7M of TRX buys as reciprocation for TRON DAO's $45M | inferred | One to four days apart. Denied by TRON. |
| The swap offered WLFI at about 30% of the public price ($0.015 vs $0.05) | inferred (arithmetic) | Derived from the $1.5B FDV in Blockworks' message. |
| USD1 itself flowing through Nobitex | not found | Reuters describes shared chains (Tron, BNB), not USD1 use. |
| Prince Group funds reaching AB or WLF | not found | All three investigations say there is no such evidence. |
| AB's Timor-Leste people and the WLF founders knowing each other before November 2025 | not found | WLF says it learned of the link in January 2026. |
| Reuters' piece (May 2026) prompting the Nobitex designation (June 2026) | inferred (timing) | No source links the two. |
| Ethena, Ondo, Sui, Sei, Avalanche or Mantle buying WLFI | not found | Only WLF's purchases of their tokens are documented. |

## Corrections

- The claim calls A7A5 "the sanctioned ruble stablecoin". The designations target its issuer and network, not the token itself.
- The Reuters Nobitex piece is dated May 2026 (syndicated 2026-05-18), not 2026-05-01 as C71's lead says.
- The Prince Group sanctions date is 2025-10-14, not 2024.
- The swap was an offer. No team is documented as having accepted it.

## Sources

1. Blockworks, "Trump-backed World Liberty Financial courts crypto teams for token swaps", 2025-02-03. https://blockworks.co/news/trump-backed-project-token-swaps
2. CoinDesk, "TRON, Movement Labs deny 'token swap' deal", 2025-02-04. https://dev.coindesk.com/markets/2025/02/04/tron-move-deny-token-swap-deal-for-world-liberty-fi-inclusion
3. The Block, "WLF disputes allegations of 'selling tokens'", 2025-02-04. https://www.theblock.co/post/338563/trump-world-liberty-financial-disputes-token-swap-allegations
4. crypto.news, token swaps report, 2025-02-04. https://crypto.news/trump-backed-world-liberty-financial-offers-token-swaps-to-crypto-firms-report/
5. CryptoPotato, "Justin Sun raises stake in WLF to $75M", 2025-01-20. https://cryptopotato.com/justin-sun-raises-stake-in-world-liberty-financial-to-75m/
6. The Block, "WLF buys $112.8M in crypto on Trump's first day", 2025-01-21. https://www.theblock.co/post/335960/world-liberty-financial-buys-112-8-million-in-crypto-on-trumps-first-day-in-office
7. CoinDesk, "WLF to buy more TRX", 2025-01-23. https://hotfix.coindesk.com/business/2025/01/23/trump-linked-world-liberty-financial-to-buy-more-trx-after-usd10m-wbtc-purchase
8. The Block, "WLF buys $25M of tokens incl. LINK, TRX, AAVE, ENA", 2025-01-20. https://www.theblock.co/amp/post/335779/trumps-world-liberty-buys-25-million-of-tokens-including-link-tron-aave-and-ethena
9. Arkham, "WLF purchases $1.85M MOVE", 2025-01-28. https://info.arkm.com/research/wlf-purchases-1-85m-move
10. Arkham, "WLF bidding DeFi", 2024-12-13. https://info.arkm.com/research/wlf-bidding-defi
11. The Block, WLF and Ethena sUSDe collaboration, 2024-12-18. https://www.theblock.co/post/331436/trump-backed-world-liberty-financial-and-ethena-eye-collaboration-starting-with-susde-implementation
12. ForkLog, WLFI partners with Ethena, 2024-12-19. https://forklog.com/en/trump-linked-firm-wlfi-partners-with-ethena/
13. CoinDesk, WLF buys $470K ONDO, 2025-02-06. https://dev.coindesk.com/markets/2025/02/06/trump-backed-world-liberty-financial-buys-usd470k-ondo-tokens
14. The Block, WLF and Ondo partner, 2025-02-12. https://www.theblock.co/post/340003/trump-world-liberty-ondo-finance-partner-expand-tokenized-rwa-adoption
15. Bloomingbit, Ondo announces then deletes, 2025-02-11. https://en.bloomingbit.io/feed/news/83126
16. Sui blog, WLF strategic reserve deal, 2025-03-06. https://blog.sui.io/world-liberty-financial-strategic-token-reserve/
17. The Block, Sui Foundation collaborator, 2025-03-06. https://www.theblock.co/amp/post/344952/trump-backed-world-liberty-financial-attracts-another-crypto-collaborator-sui-foundation
18. Arkham, WLF buys $100K SEI, 2025-03-13. https://info.arkm.com/research/world-liberty-fi-buys-100k-sei
19. crypto.news, WLFI's $775K SEI purchase, 2025-04-12. https://crypto.news/wlfis-775k-sei-purchase-lifts-sei-price-20-before-stalling-at-resistance
20. The Daily Hodl, AVAX/MNT and $118M losses, 2025-03-17. https://dailyhodl.com/2025/03/17/president-trumps-world-liberty-financial-purchases-more-crypto-as-total-losses-hits-118000000-on-chain-data
21. Crypto Briefing, WLF buys AVAX and MNT, 2025-03-16. https://cryptobriefing.com/trump-backed-crypto-venture-buys-tokens
22. Arkham, anonymous address buys $10M WLF, 2025-01-31. https://info.arkm.com/research/anonymous-address-purchases-10m-wlf-tokens
23. Arkham, WLF purchases $21.5M, 2025-03-06. https://info.arkm.com/research/world-liberty-fi-purchases-21-5m-of-crypto
24. Press release, WLFI partners with AB to deploy USD1 on AB Chain, 2025-11-13. https://www.theblock.co/press-releases/wlfi-partners-with-ab-to-deploy-the-usd1-stablecoin-on-ab-chain-378790
25. Decrypt, WLF partner linked to sanctioned Cambodian scam company, 2026-04-06. https://decrypt.co/363617/partner-trump-backed-world-liberty-sanctioned-cambodian-scam-company
26. WSJ (syndicated), "Crypto venture linked to men sanctioned in scam-ring probe partnered with Trump firm", 2026-04-28. https://www.itiger.com/news/2631587318
27. CryptoPotato, WLFI partnered with project linked to alleged fraud syndicate, 2026-04. https://cryptopotato.com/report-trump-linked-wlfi-partnered-with-project-linked-to-alleged-fraud-syndicate/
28. Whale Alert, AB DAO partnership questioned, 2026-04. https://whale-alert.io/stories/8aa80144b5deb8/World-Liberty-Financials-partnership-with-AB-DAO-quest
29. OCCRP, Timor-Leste scammers back at work, 2026. https://occrp.org/en/news/scammers-timor-leste-go-straight-back-to-work
30. Senate Banking minority, Warren and Reed on WLF and sanctioned criminals, 2026-05-14. https://www.banking.senate.gov/newsroom/minority/ahead-of-committee-crypto-market-structure-markup-warren-and-reed-call-for-investigation-into-world-liberty-financials-latest-apparent-failure-to-detect-ties-to-sanctioned-criminals
31. Senate Banking minority, letter to Bessent and Blanche, 2026-05-13. https://www.banking.senate.gov/download/20260513-letter-to-bessent-blanche-on-wlf&download=1
32. US Treasury, Prince Group action (sb0278), 2025-10-14. https://home.treasury.gov/news/press-releases/sb0278
33. Radio Free Asia, US and UK sanction Prince Group, 2025-10-14. https://rfa.org/english/cambodia/2025/10/14/sanctions-scam-prince-group/
34. Senate Banking minority, Warren and Reed press DOJ and Treasury, 2025-11-18. https://www.banking.senate.gov/newsroom/minority/as-congress-considers-potential-market-structure-legislation-warren-and-reed-press-doj-and-treasury-on-national-security-risks-posed-by-trump-affiliated-crypto-ventures-sale-of-tokens-to-illicit-actors
35. Letter to Bessent and Bondi on WLFI token sales, 2025-11-17. https://www.banking.senate.gov/imo/media/doc/letter_to_bessent_and_bondi_on_wlfi_token_sales.pdf
36. Bitcoin.com News, "American Sell-Out" (Accountable.US), 2025-09. https://news.bitcoin.com/american-sell-out-trump-family-linked-world-liberty-accused-of-deals-with-us-adversaries
37. Cointelegraph, senators call WLFI a national security threat, 2025-11-18. https://cointelegraph.com/news/senators-trump-linked-wlfi-national-security-threat
38. US Treasury, Garantex/Grinex/A7A5 action, 2025-08-14. https://content.govdelivery.com/accounts/USTREAS/bulletins/3eddd45
39. OFAC recent actions, 2025-08-14. https://ofac.treasury.gov/recent-actions/20250814
40. Elliptic, OFAC targets stablecoins for Russian sanctions evasion, 2025-08-14. https://www.elliptic.co/blog/ofac-targets-use-of-stablecoins-for-russian-sanctions-evasion
41. Reuters (via Yahoo Finance), Trump's crypto venture and Iran's top exchange share networks, 2026-05-18. https://finance.yahoo.com/markets/crypto/articles/exclusive-trumps-crypto-venture-irans-080805071.html
42. The Next Web, on the Reuters report, 2026-05. https://thenextweb.com/news/trump-world-liberty-financial-iran-nobitex-reuters
43. Reuters (via MarketScreener), 2026-05-18. https://www.marketscreener.com/news/how-trump-s-crypto-venture-and-iran-s-top-exchange-tapped-into-the-same-industry-networks-ce7f5adad880f324
44. The Block, US sanctions Nobitex ("Economic Fury"), 2026-06-02. https://www.theblock.co/news/regulation/2026-06-02-us-sanctions-nobitex-iranian-crypto-exchanges-economic-fury-campaign-403436
45. US Treasury, press release sb0519 (Nobitex), 2026-06-02. https://home.treasury.gov/news/press-releases/sb0519
46. Elliptic, OFAC sanctions Nobitex and three others, 2026-06-02. https://www.elliptic.co/blog/ofac-sanctions-nobitex-and-three-other-iranian-cryptoasset-exchanges
47. Cointelegraph (press release), USD1 begins minting on TRON, 2025-06-13. https://cointelegraph.com/press-releases/usd1-stablecoin-begins-minting-on-tron
48. Yellow, USD1 launches on Tron, 2025-06-11. https://yellow.com/news/trx-surges-6-as-trump-linked-stablecoin-usd1-launches-on-tron-network
49. Bloomingbit, official debut of USD1 on Tron, 2025-06-11. https://en.bloomingbit.io/feed/news/90215
50. Bloomberg, Sun sues WLF alleging extortion, 2026-04-22. https://www.bloomberg.com/news/articles/2026-04-22/crypto-billionaire-sues-trump-linked-project-alleging-extortion
51. CBS News, Justin Sun sues World Liberty, 2026-04-22. https://www.cbsnews.com/news/justin-sun-sues-trump-world-liberty-crypto-tokens/
52. DL News, WLF slams Sun lawsuit, 2026-04. https://dlnews.com/articles/regulation/world-liberty-financial-slams-justin-sun-lawsuit/
53. Business Wire, WLF closes $550M across token sales, 2025-03-17. https://www.businesswire.com/news/home/20250317855322/en/Trump-Inspired-World-Liberty-Financial-Closes-$550-Million-Across-Token-Sales
54. NBC/CNBC, WLF says it sold $550M, 2025-03-18. https://www.nbcsandiego.com/news/business/money-report/trumps-world-liberty-financial-crypto-project-says-it-sold-550-million-in-tokens/3781088/
55. Blockworks, WLF KYC starts, 2024-10. https://blockworks.co/news/world-liberty-financial-kyc-starts
56. The Block, WLF reallocates funds after "third-party security lapses", 2025-11. https://theblock.co/post/379561/trump-backed-world-liberty-financial-reallocates-funds-following-third-party-security-lapses
57. Senate Banking minority, letter on Aqua 1, 2026-09-15. https://www.banking.senate.gov/imo/media/doc/20260915lettertobessentandblancheonaqua1.pdf

## Second review (audit)

Result: **upheld**.

Checked:
- TRON DAO's $45M WLFI purchase (19 Jan 2025) and WLF's TRX buys of ~$4.7M (20 Jan) plus ~$2.6M (22-23 Jan)
- AB's planned Timor-Leste resort principals (Yang Jian, Yang Yanming, Shih Ting-yu) sanctioned in the 14 Oct 2025 Prince Group action, four weeks before the WLF-AB USD1 deal
- Reuters' finding that Nobitex moved at least $2.3B over Tron and BNB Chain

Changes:
- TRX: confirmed the purchase figures (The Block, CoinDesk); labelled the ~$7M+ total as our sum of reported buys.
- AB/Prince: confirmed via WSJ relays (Decrypt, iTiger); added Yang Jian's lawyers' denial of any Prince affiliation, that the US designations concerned a Palau resort, and the stake discrepancy (controlling vs. 60%).
- Relationship dt-marks-defi-llc -> WLF: marked the 'including swap-partner purchases' element as our inference.
- Nobitex: the $2.3B ($2B Tron, $317M BNB) figures and the 'no suggestion the Trump family knew' caveat are confirmed by syndicated copies; no contradicting reporting found.

New sources:
- The Block, "World Liberty Financial buys $112.8 million in crypto on Trump's first day in office", 2025-01-20. https://www.theblock.co/post/335960/world-liberty-financial-buys-112-8-million-in-crypto-on-trumps-first-day-in-office
- CoinDesk via Yahoo Finance, "Trump-Linked World Liberty Financial Buys $2.6M TRX and $10M WBTC", 2025-01-23. https://sg.finance.yahoo.com/news/trump-linked-world-liberty-financial-134035322.html
- WSJ via iTiger, "Crypto Venture Linked to Men Sanctioned in Scam-Ring Probe Partnered With Trump Firm -- WSJ", 2026-04-28. https://www.itiger.com/news/2631587318
- Reuters via Yahoo Finance, "Exclusive: Trump's crypto venture and Iran's largest exchange share same blockchain networks", 2026-05. https://finance.yahoo.com/markets/crypto/articles/exclusive-trumps-crypto-venture-irans-080805071.html
