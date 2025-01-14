import {studioTheme, ThemeProvider} from '@sanity/ui'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {App} from './components/App'

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ThemeProvider theme={studioTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
