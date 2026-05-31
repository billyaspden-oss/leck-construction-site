// Cloudflare Worker — injects Sanity-managed vacancies & news into the
// existing static pages. Everything else passes through to static assets.
//
// Routes handled:
//   /vacancies            -> inject vacancy list into vacancies.html
//   /vacancies/<slug>     -> single vacancy (+ JobPosting JSON-LD)
//   /news                 -> inject news grid into news.html
//   /news/<slug>          -> single article (+ Article JSON-LD)
// All other paths -> env.ASSETS (the existing site, untouched).

import * as sanity from './sanity.js'
import {
  esc, vacancyItemsHtml, emptyVacanciesHtml, vacancyDetailHtml, jobPostingLd,
  newsGridsHtml, emptyNewsHtml, articleHtml, articleLd, ARTICLE_STYLES,
} from './render.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '') || '/'
    const isRead = request.method === 'GET' || request.method === 'HEAD'

    // If the CMS isn't configured yet, or it's not a read, serve the site as-is.
    if (!isRead || !sanity.configured(env)) return env.ASSETS.fetch(request)

    try {
      if (path === '/vacancies') return await vacanciesList(env, request)
      if (path.startsWith('/vacancies/')) {
        const slug = decodeURIComponent(path.slice('/vacancies/'.length))
        if (slug) return await vacancyDetail(env, request, slug)
      }
      if (path === '/news') return await newsList(env, request)
      if (path.startsWith('/news/')) {
        const slug = decodeURIComponent(path.slice('/news/'.length))
        if (slug) return await newsDetail(env, request, slug)
      }
    } catch (err) {
      // Sanity unreachable / bad data -> fall back to the static page so the
      // site never goes down because of the CMS.
      console.error('CMS render error:', err && err.message)
      return env.ASSETS.fetch(request)
    }

    return env.ASSETS.fetch(request)
  },
}

function shellFor(env, request, file) {
  return env.ASSETS.fetch(new Request(new URL(file, request.url).toString(), { method: 'GET' }))
}

// Mirrors public/_headers but adds cdn.sanity.io to img-src (Sanity image CDN).
// Worker-rendered routes bypass the static _headers layer, so we set them here.
const CSP = "default-src 'self'; img-src 'self' data: https://cdn.sanity.io https://www.google.com https://maps.gstatic.com https://*.openstreetmap.org https://*.tile.openstreetmap.org; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src https://www.google.com https://maps.google.com https://www.openstreetmap.org; connect-src 'self' https://api.web3forms.com"

function finalize(transformed) {
  const headers = new Headers(transformed.headers)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Content-Security-Policy', CSP)
  return new Response(transformed.body, { status: 200, headers })
}

/* ---------- handlers ---------- */

async function vacanciesList(env, request) {
  const vacancies = await sanity.listVacancies(env)
  const html = vacancies.length ? vacancyItemsHtml(vacancies) : emptyVacanciesHtml()
  const shell = await shellFor(env, request, '/vacancies.html')
  const out = new HTMLRewriter()
    .on('.vac-list', { element(el) { el.setInnerContent(html, { html: true }) } })
    .transform(shell)
  return finalize(out)
}

async function vacancyDetail(env, request, slug) {
  const v = await sanity.getVacancy(env, slug)
  if (!v) return env.ASSETS.fetch(request)
  const url = new URL(request.url)
  const canonical = `${url.origin}/vacancies/${slug}`
  const out = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(`${v.title} — Careers | Leck Construction Ltd`) } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', canonical) } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', v.summary) } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', `${v.title} — Careers`) } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', v.summary) } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', canonical) } })
    .on('head', { element(el) {
      el.append(ARTICLE_STYLES, { html: true })
      el.append(`<script type="application/ld+json">${jobPostingLd(v)}</script>`, { html: true })
    } })
    .on('.vac-list', { element(el) { el.setInnerContent(vacancyDetailHtml(v, env), { html: true }) } })
    .transform(await shellFor(env, request, '/vacancies.html'))
  return finalize(out)
}

async function newsList(env, request) {
  const posts = await sanity.listPosts(env)
  const html = posts.length ? newsGridsHtml(posts, env) : emptyNewsHtml()
  const shell = await shellFor(env, request, '/news.html')
  const out = new HTMLRewriter()
    .on('section.news-section .container', { element(el) { el.setInnerContent(html, { html: true }) } })
    .transform(shell)
  return finalize(out)
}

async function newsDetail(env, request, slug) {
  const post = await sanity.getPost(env, slug)
  if (!post) return env.ASSETS.fetch(request)
  const url = new URL(request.url)
  const canonical = `${url.origin}/news/${slug}`
  const coverUrl = sanity.imageUrl(env, post.coverImage, { width: 1600 })

  const rw = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(`${post.title} | Leck Construction Ltd`) } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', canonical) } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', post.excerpt) } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', post.title) } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', post.excerpt) } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', canonical) } })
    .on('head', { element(el) {
      el.append(ARTICLE_STYLES, { html: true })
      el.append(`<script type="application/ld+json">${articleLd(post, canonical, coverUrl)}</script>`, { html: true })
      if (coverUrl) el.append(`<meta property="og:image" content="${esc(coverUrl)}">`, { html: true })
    } })
    .on('.sec-hero .sh-title', { element(el) { el.setInnerContent(esc(post.title), { html: true }) } })
    .on('.sec-hero .sh-sub', { element(el) { el.setInnerContent(esc(post.excerpt)) } })
    .on('.breadcrumb', { element(el) {
      el.setInnerContent(`<a href="/">Home</a><span>/</span><a href="/news">News</a><span>/</span><span>${esc(post.title)}</span>`, { html: true })
    } })
    .on('section.news-section .container', { element(el) { el.setInnerContent(articleHtml(post, env), { html: true }) } })

  if (coverUrl) {
    rw.on('.sec-hero .sh-bg', { element(el) { el.setAttribute('style', `background-image:url('${esc(coverUrl)}')`) } })
  }
  return finalize(rw.transform(await shellFor(env, request, '/news.html')))
}
