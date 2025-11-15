import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { QuizProvider } from './context/QuizContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <QuizProvider>
        <App />
      </QuizProvider>
    </HashRouter>
  </StrictMode>,
)
