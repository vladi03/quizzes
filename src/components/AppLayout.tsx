import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          QuizSpark
        </Link>
        <nav className="app-nav">
          <Link to="/">Quizzes</Link>
          <a href="#export-tools">Export</a>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        Update quiz content anytime by replacing <code>quizzes.json</code> on
        your host.
      </footer>
    </div>
  )
}
