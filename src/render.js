// HTML fragment + JSON-LD builders. Output is injected into the existing
// static pages, so markup reuses the site's existing classes.

import { imageUrl } from './sanity.js'
import { portableTextToHtml } from './portable-text.js'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const ORG = 'Leck Construction Ltd'
const SITE = 'https://leckconstruction.co.uk'

const EMPLOYMENT_LABELS = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACTOR: 'Contract', INTERN: 'Apprenticeship',
}

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function monthYear(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00Z`)
  if (isNaN(d)) return esc(dateStr)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/* ---------- Vacancies ---------- */

export function vacancyItemsHtml(vacancies) {
  return vacancies.map((v) => {
    const type = EMPLOYMENT_LABELS[v.employmentType] || ''
    return `
    <a class="vac-item reveal" href="/vacancies/${esc(v.slug)}" style="text-decoration:none">
      <div>
        <div class="vac-tags">
          ${type ? `<span class="vac-tag">${esc(type)}</span>` : ''}
          ${v.salary ? `<span class="vac-tag">${esc(v.salary)}</span>` : ''}
        </div>
        <div class="vac-title">${esc(v.title)}</div>
        <div class="vac-loc">${esc(v.location)}</div>
        <p class="vac-desc">${esc(v.summary)}</p>
      </div>
      <span class="vac-apply">View &amp; apply</span>
    </a>`
  }).join('\n')
}

export function emptyVacanciesHtml() {
  return `
    <div class="vac-item">
      <div>
        <div class="vac-title">No current vacancies</div>
        <p class="vac-desc">We don't have any open roles right now, but we always welcome speculative applications from experienced construction professionals — send us your CV and we'll be in touch if a suitable position arises.</p>
      </div>
      <a class="vac-apply" href="mailto:admin@leck.co">Send your CV</a>
    </div>`
}

export function vacancyDetailHtml(v, env) {
  const type = EMPLOYMENT_LABELS[v.employmentType] || ''
  const descHtml = (v.description && v.description.length)
    ? portableTextToHtml(v.description, env)
    : `<p>${esc(v.summary)}</p>`
  const applyHref = v.applyUrl
    ? esc(v.applyUrl)
    : `mailto:${esc(v.applyEmail || 'admin@leck.co')}?subject=${encodeURIComponent('Application: ' + v.title)}`
  const closing = v.closingDate ? ` · Closing ${monthYear(v.closingDate)}` : ''
  return `
    <div class="cms-article">
      <div class="cms-meta">
        ${type ? `<span class="news-cat">${esc(type)}</span>` : ''}
        ${v.salary ? `<span class="cms-date">${esc(v.salary)}</span>` : ''}
      </div>
      <h2 style="font-family:var(--display);font-size:clamp(1.7rem,3.5vw,2.6rem);font-weight:800;letter-spacing:-.03em;color:var(--navy);line-height:1.1;margin-bottom:10px">${esc(v.title)}</h2>
      <div class="vac-loc" style="margin-bottom:32px">${esc(v.location)}${closing}</div>
      ${descHtml}
      <p style="margin-top:36px"><a class="vac-apply" href="${applyHref}">Apply for this role</a></p>
      <p class="cms-back"><a href="/vacancies">← All vacancies</a></p>
    </div>`
}

export function jobPostingLd(v) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: v.title,
    description: v.summary,
    datePosted: v._createdAt,
    employmentType: v.employmentType,
    hiringOrganization: { '@type': 'Organization', name: ORG, sameAs: SITE, logo: `${SITE}/images/leck-logo.png` },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: v.location, addressRegion: 'Cumbria', addressCountry: 'GB' },
    },
  }
  if (v.closingDate) ld.validThrough = v.closingDate
  if (v.applyUrl) ld.directApply = false
  return JSON.stringify(ld)
}

/* ---------- News ---------- */

export function newsGridsHtml(posts, env) {
  // group by year, newest first
  const byYear = new Map()
  for (const p of posts) {
    const y = (p.publishDate || '').slice(0, 4) || 'Latest'
    if (!byYear.has(y)) byYear.set(y, [])
    byYear.get(y).push(p)
  }
  const years = [...byYear.keys()].sort((a, b) => (a < b ? 1 : -1))
  return years.map((y, i) => {
    const cards = byYear.get(y).map((p) => {
      const cover = imageUrl(env, p.coverImage, { width: 800 })
      const img = cover
        ? `<div class="news-img"><img src="${esc(cover)}" alt="${esc((p.coverImage && p.coverImage.alt) || p.title)}" loading="lazy"></div>`
        : ''
      return `
      <article class="news-card reveal">
        ${img}
        <span class="news-cat">${esc(p.category)}</span>
        <div class="news-date">${monthYear(p.publishDate)}</div>
        <h2 class="news-title">${esc(p.title)}</h2>
        <p class="news-excerpt">${esc(p.excerpt)}</p>
        <a class="news-link" href="/news/${esc(p.slug)}">Read more</a>
      </article>`
    }).join('\n')
    const divider = i < years.length - 1 ? '<hr class="news-divider">' : ''
    return `<div class="news-section-label">${esc(y)}</div><div class="news-grid">${cards}</div>${divider}`
  }).join('\n')
}

export function emptyNewsHtml() {
  return `<div class="news-section-label">Latest</div><p style="font-size:.95rem;color:var(--grey-500)">No news posts have been published yet — please check back soon.</p>`
}

export function articleHtml(post, env) {
  const bodyHtml = (post.body && post.body.length) ? portableTextToHtml(post.body, env) : `<p>${esc(post.excerpt)}</p>`
  return `
    <article class="cms-article reveal">
      <div class="cms-meta">
        <span class="news-cat">${esc(post.category)}</span>
        <span class="cms-date">${monthYear(post.publishDate)}</span>
      </div>
      ${bodyHtml}
      <p class="cms-back"><a href="/news">← Back to all news</a></p>
    </article>`
}

export function articleLd(post, canonicalUrl, coverUrl) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    description: post.excerpt,
    author: { '@type': 'Organization', name: ORG },
    publisher: { '@type': 'Organization', name: ORG, logo: { '@type': 'ImageObject', url: `${SITE}/images/leck-logo.png` } },
    mainEntityOfPage: canonicalUrl,
  }
  if (coverUrl) ld.image = [coverUrl]
  return JSON.stringify(ld)
}

// Scoped prose styles, appended to <head> on detail pages.
export const ARTICLE_STYLES = `<style>
.cms-article{max-width:760px;margin:0 auto}
.cms-article .cms-meta{display:flex;gap:14px;align-items:center;margin-bottom:26px}
.cms-article .cms-date{font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--grey-400)}
.cms-article p{font-size:1rem;line-height:1.85;color:var(--grey-500);margin-bottom:20px}
.cms-article h2{font-family:var(--display);font-size:1.6rem;font-weight:800;color:var(--navy);letter-spacing:-.02em;margin:40px 0 14px}
.cms-article h3{font-family:var(--display);font-size:1.25rem;font-weight:700;color:var(--navy);margin:32px 0 12px}
.cms-article ul,.cms-article ol{margin:0 0 20px 22px}
.cms-article li{font-size:1rem;line-height:1.8;color:var(--grey-500);margin-bottom:8px}
.cms-article blockquote{border-left:3px solid var(--blue);padding:4px 0 4px 20px;margin:24px 0;font-style:italic;color:var(--grey-500)}
.cms-article a{color:var(--blue);text-decoration:underline}
.cms-article figure{margin:28px 0}
.cms-article figure img{width:100%;border-radius:8px}
.cms-back{margin-top:48px}
.cms-back a{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--navy);text-decoration:none;border-bottom:2px solid var(--blue);padding-bottom:2px}
</style>`
