# Client / Partner Logo Manifest

Logos harvested for the Leck Construction client logo wall.
Location: `public/images/clients/`
Harvested: 2026-06-17

**Note on method:** The Clearbit Logo API (`logo.clearbit.com`) was the intended
primary source but its DNS no longer resolves (the service was sunset by HubSpot
in late 2025) — every Clearbit request failed with a connection error. All logos
below were instead sourced from Wikimedia Commons / English Wikipedia (official
SVG uploads) or directly from each company's own website. This produced higher
quality assets than Clearbit would have (mostly scalable SVG wordmarks).

| # | Company | Filename | Format | Approx size | Source | Confidence |
|---|---------|----------|--------|-------------|--------|------------|
| 1 | BAE Systems | `bae-systems.svg` | SVG | 3.4 KB | Wikimedia Commons | Official SVG wordmark — high confidence |
| 2 | Kimberly-Clark | `kimberly-clark.svg` | SVG | 6.4 KB | Wikimedia Commons | Official SVG wordmark — high confidence |
| 3 | GSK | `gsk.png` | PNG | 1.8 KB (400×132) | English Wikipedia (SVG) → rasterised by lead | The harvested `gsk.svg` was 1.5 MB because it embedded 3 base64 PNGs (so svgo couldn't shrink it). Lead rasterised it to a small cropped PNG (400×132) and deleted the bloated SVG. Crisp at tile size. |
| 4 | Ørsted | `orsted.svg` | SVG | 3.2 KB | Wikimedia Commons | Official SVG wordmark — high confidence |
| 5 | Westmorland & Furness Council | `westmorland-furness-council.svg` | SVG | 4.9 KB | Wikimedia Commons | Official 2022 council SVG logo — high confidence |
| 6 | Morecambe Bay Trust (NHS) — University Hospitals of Morecambe Bay NHS FT | `morecambe-bay-nhs.png` | PNG | 7.7 KB (260×108) | uhmb.nhs.uk (official site) | Official trust header logo (the trust's own NHS lockup). Raster, modest resolution — fine at small tile size; may pixelate if enlarged. |
| 7 | Spar (UK) | `spar.svg` | SVG | 3.0 KB | Wikimedia Commons | Official SPAR SVG logo (the green/red fir-tree wordmark) — high confidence |
| 8 | South Lakes Housing | `south-lakes-housing.svg` | SVG | 15 KB | southlakeshousing.co.uk (official site) | Official SVG wordmark BUT it is the **white/reversed** version (`fill="#fff"`). It is the only SVG the site exposes (their header sits on a dark band). It will be **invisible on a white background** — place it on a dark tile, or apply a CSS filter / recolour the fill to wire it onto a light logo wall. |
| 9 | JF Hunt → John F Hunt (johnfhunt.co.uk) | `jf-hunt.png` | PNG | 445 B (228×30) | johnfhunt.co.uk (official site) | Official header wordmark, but **low resolution** (228×30) and small. Acceptable for a small tile; no higher-res or SVG version is published on the site. Correct entity confirmed: "John F Hunt" (demolition/civils/regeneration contractor), parent of John F Hunt Regeneration Ltd. May want a better asset later. |
| 10 | NG Bailey | `ng-bailey.svg` | SVG | 6.9 KB | ngbailey.com (official site, `/media/hnffhio0/logo.svg`) | Official SVG logo (solid block mark + wordmark) — high confidence |
| 11 | NewRiver (NewRiver REIT) | `newriver.svg` | SVG | 6.7 KB | English Wikipedia | Official SVG wordmark — high confidence |

## Source URLs

1. BAE Systems — https://upload.wikimedia.org/wikipedia/commons/7/73/BAE_Systems_logo.svg
2. Kimberly-Clark — https://upload.wikimedia.org/wikipedia/commons/8/88/Kimberly-Clark_logo.svg
3. GSK — https://upload.wikimedia.org/wikipedia/en/3/32/GSK_logo_2022.svg
4. Ørsted — https://upload.wikimedia.org/wikipedia/commons/f/fe/%C3%98rsted_logo.svg
5. Westmorland & Furness Council — https://upload.wikimedia.org/wikipedia/commons/9/9a/United_Kingdom_Westmorland_and_Furness_Council_2022.svg
6. Morecambe Bay NHS — https://www.uhmb.nhs.uk/application/files/7115/8211/8915/main-logo.png
7. Spar — https://upload.wikimedia.org/wikipedia/commons/7/71/SPAR_Logo.svg
8. South Lakes Housing — https://www.southlakeshousing.co.uk/wp-content/uploads/2024/10/slh-logo-white.svg
9. John F Hunt — https://www.johnfhunt.co.uk/wp-content/uploads/2018/04/JFH.png
10. NG Bailey — https://www.ngbailey.com/media/hnffhio0/logo.svg
11. NewRiver — https://upload.wikimedia.org/wikipedia/en/7/79/NewRiver_logo.svg

## How these are wired in (homepage rolling marquee)

All 11 are used in the `.clients` rolling marquee on `index.html`, rendered grayscale
(`filter:grayscale(100%)`, ~0.62 opacity) and colourised on hover — a standard logo wall.
- **South Lakes Housing** uses an extra class `client-logo--invert` (`filter:brightness(0)`)
  so the white/reversed SVG shows as a dark silhouette on the white band. (Can't show its
  real colour on white — fine as a silhouette.)
- **GSK** uses the rasterised PNG (see above).

## Items still worth improving later

- **John F Hunt** — only a small low-res PNG (228×30) is published; source a vector/hi-res
  version directly from the company if crispness matters at larger sizes.
- **South Lakes Housing** — currently a dark silhouette via CSS. If they can supply a
  full-colour or dark-on-transparent logo, swap it in and drop the `client-logo--invert` class.
- **GSK** — rasterised to PNG; fine at tile size. Re-source a clean (non-embedded) SVG if a
  larger crisp render is ever needed.
- **Morecambe Bay NHS** — raster PNG (260×108), no SVG published; adequate for small tiles only.
- All other 7 are clean scalable official SVG wordmarks.
