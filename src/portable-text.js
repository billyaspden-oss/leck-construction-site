// Minimal Portable Text -> HTML renderer (no dependencies).
// Handles headings, paragraphs, blockquote, bullet/number lists,
// strong/em/links, and inline images.

import { imageUrl } from './sanity.js'

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSpans(children = [], markDefs = []) {
  return children
    .map((child) => {
      if (child._type !== 'span') return ''
      let html = esc(child.text)
      const marks = child.marks || []
      // wrap decorators + annotation links (inner-most first)
      for (const mark of marks) {
        if (mark === 'strong') html = `<strong>${html}</strong>`
        else if (mark === 'em') html = `<em>${html}</em>`
        else if (mark === 'underline') html = `<u>${html}</u>`
        else {
          const def = markDefs.find((d) => d._key === mark)
          if (def && def._type === 'link' && def.href) {
            const rel = /^https?:\/\//.test(def.href) ? ' rel="noopener" target="_blank"' : ''
            html = `<a href="${esc(def.href)}"${rel}>${html}</a>`
          }
        }
      }
      return html
    })
    .join('')
}

function renderBlock(block) {
  const inner = renderSpans(block.children, block.markDefs)
  switch (block.style) {
    case 'h2': return `<h2>${inner}</h2>`
    case 'h3': return `<h3>${inner}</h3>`
    case 'h4': return `<h4>${inner}</h4>`
    case 'blockquote': return `<blockquote>${inner}</blockquote>`
    default: return `<p>${inner}</p>`
  }
}

export function portableTextToHtml(blocks, env) {
  if (!Array.isArray(blocks)) return ''
  const out = []
  let listType = null // 'bullet' | 'number'

  const closeList = () => {
    if (listType) {
      out.push(listType === 'number' ? '</ol>' : '</ul>')
      listType = null
    }
  }

  for (const block of blocks) {
    if (block._type === 'image') {
      closeList()
      const url = imageUrl(env, block, { width: 1200 })
      if (url) {
        out.push(
          `<figure><img src="${esc(url)}" alt="${esc(block.alt || '')}" loading="lazy"></figure>`,
        )
      }
      continue
    }
    if (block._type !== 'block') continue

    if (block.listItem === 'bullet' || block.listItem === 'number') {
      if (listType !== block.listItem) {
        closeList()
        listType = block.listItem
        out.push(listType === 'number' ? '<ol>' : '<ul>')
      }
      out.push(`<li>${renderSpans(block.children, block.markDefs)}</li>`)
    } else {
      closeList()
      out.push(renderBlock(block))
    }
  }
  closeList()
  return out.join('\n')
}
