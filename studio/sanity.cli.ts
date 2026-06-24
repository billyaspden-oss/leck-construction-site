import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'mwcxu5ei',
    dataset: 'production',
  },
  // The hosted Studio will live at https://<this>.sanity.studio
  studioHost: 'leck-construction',
  deployment: {
    appId: 'a9ypge8tt5h2tyoduqrrs0e7',
  },
})
