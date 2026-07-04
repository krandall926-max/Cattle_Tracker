import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
// Bundled slab-serif for headings — gives the app a sturdy, ranch feel while
// staying fully offline (no web-font fetch). Body text stays on system fonts.
import '@fontsource/zilla-slab/500.css'
import '@fontsource/zilla-slab/600.css'
import '@fontsource/zilla-slab/700.css'
import './index.css'
import { seedIfNeeded } from './db/seed'

// Seed pasture names on first run, then mount. HashRouter keeps deep links
// working on plain static hosts (GitHub Pages) with no server rewrites.
seedIfNeeded().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>,
  )
})
