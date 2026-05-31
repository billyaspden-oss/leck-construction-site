// Minimal, dependency-free Sanity client for Cloudflare Workers.
// Reads PUBLISHED content only, via Sanity's public read API (no token).

const API_VERSION = 'v2022-03-07'

function apiBase(env) {
  const pid = env.SANITY_PROJECT_ID
  const ds = env.SANITY_DATASET || 'production'
  return `https://${pid}.apicdn.sanity.io/${API_VERSION}/data/query/${ds}`
}

export function configured(env) {
  return Boolean(env && env.SANITY_PROJECT_ID && env.SANITY_PROJECT_ID !== 'REPLACE_WITH_PROJECT_ID')
}

async function query(env, groq, params = {}) {
  const url = new URL(apiBase(env))
  url.searchParams.set('query', groq)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`$${k}`, JSON.stringify(v))
  }
  const res = await fetch(url.toString(), {
    cf: { cacheTtl: 60, cacheEverything: true },
  })
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const data = await res.json()
  return data.result
}

// Build a Sanity image CDN URL from an image field. Returns null if absent.
export function imageUrl(env, image, { width } = {}) {
  const ref = image && image.asset && image.asset._ref
  if (!ref) return null
  // ref looks like: image-<id>-<w>x<h>-<ext>
  const [, id, dims, ext] = ref.split('-')
  const ds = env.SANITY_DATASET || 'production'
  let url = `https://cdn.sanity.io/images/${env.SANITY_PROJECT_ID}/${ds}/${id}-${dims}.${ext}`
  if (width) url += `?w=${width}&fit=max&auto=format`
  return url
}

const VACANCY_FIELDS = `
  title, "slug": slug.current, location, employmentType, salary,
  summary, description, closingDate, applyEmail, applyUrl, _createdAt
`

export function listVacancies(env) {
  return query(
    env,
    `*[_type=="vacancy" && published==true && (!defined(closingDate) || closingDate >= now())]
       | order(_createdAt desc){${VACANCY_FIELDS}}`,
  )
}

export function getVacancy(env, slug) {
  return query(
    env,
    `*[_type=="vacancy" && published==true && slug.current==$slug][0]{${VACANCY_FIELDS}}`,
    { slug },
  )
}

const POST_LIST_FIELDS = `
  title, "slug": slug.current, category, publishDate, excerpt, coverImage
`

export function listPosts(env) {
  return query(
    env,
    `*[_type=="post" && published==true] | order(publishDate desc){${POST_LIST_FIELDS}}`,
  )
}

export function getPost(env, slug) {
  return query(
    env,
    `*[_type=="post" && published==true && slug.current==$slug][0]{
       ${POST_LIST_FIELDS}, body
     }`,
    { slug },
  )
}
