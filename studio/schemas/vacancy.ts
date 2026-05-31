import { defineType, defineField } from 'sanity'

export const vacancy = defineType({
  name: 'vacancy',
  title: 'Vacancy',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Job title',
      type: 'string',
      description: 'e.g. "Site Manager" or "Quantity Surveyor"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Auto-filled from the job title — just click "Generate".',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "Barrow-in-Furness" or "South Cumbria (site-based)"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-time', value: 'FULL_TIME' },
          { title: 'Part-time', value: 'PART_TIME' },
          { title: 'Contract', value: 'CONTRACTOR' },
          { title: 'Apprenticeship', value: 'INTERN' },
        ],
        layout: 'radio',
      },
      initialValue: 'FULL_TIME',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'salary',
      title: 'Salary (optional)',
      type: 'string',
      description: 'e.g. "£35,000–£45,000" or "Competitive, DOE". Leave blank to hide.',
    }),
    defineField({
      name: 'summary',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown in the vacancies list.',
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The full job advert. Use the toolbar for headings, bold and bullet lists.',
    }),
    defineField({
      name: 'closingDate',
      title: 'Closing date (optional)',
      type: 'date',
      description: 'After this date the role is automatically hidden from the site.',
    }),
    defineField({
      name: 'applyEmail',
      title: 'Apply by email',
      type: 'string',
      description: 'Where applications should be sent.',
      initialValue: 'admin@leck.co',
    }),
    defineField({
      name: 'applyUrl',
      title: 'Apply link (optional)',
      type: 'url',
      description: 'If applications go through an external link (e.g. Indeed), paste it here. Overrides the email button.',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Turn OFF to hide this role from the website without deleting it.',
      initialValue: true,
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', published: 'published' },
    prepare({ title, subtitle, published }) {
      return { title, subtitle: `${published ? '🟢' : '⚪️ Hidden'} · ${subtitle || ''}` }
    },
  },
})
