import { defineType, defineField } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'News / Newsletter',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Auto-filled from the headline — just click "Generate".',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Company News',
          'Commercial & Health',
          'Heritage & Conservation',
          'Industrial & Civil',
          'Private & Social Housing',
          'Strategic Partnerships',
        ],
      },
      initialValue: 'Company News',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Date',
      type: 'date',
      description: 'Shown on the article and used to order the news list.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Image description',
          type: 'string',
          description: 'Describe the photo for screen readers and Google (e.g. "Completed housing scheme in Barrow").',
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown on the news listing and in Google/social previews.',
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: 'body',
      title: 'Article',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Image description', type: 'string' }],
        },
      ],
      description: 'The full article. Use the toolbar for headings, bold, links, lists and inline images.',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Turn OFF to hide this article from the website without deleting it.',
      initialValue: true,
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: 'publishDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'publishDate', media: 'coverImage', published: 'published' },
    prepare({ title, date, media, published }) {
      return { title, subtitle: `${published ? '🟢' : '⚪️ Hidden'} · ${date || 'no date'}`, media }
    },
  },
})
