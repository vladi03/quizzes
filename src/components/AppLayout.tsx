import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AccountMenu } from './AccountMenu'
import { CloudSyncToast } from './CloudSyncToast'

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
        <div className="app-header__right">
          <nav className="app-nav">
            <Link to="/">Quizzes</Link>
            <a href="#export-tools">Export</a>
          </nav>
          <AccountMenu />
        </div>
      </header>
      <main className="app-main">
        <CloudSyncToast />
        {children}
      </main>
      <footer className="app-footer">
        Update quiz content anytime by replacing <code>quizzes.json</code> on
        your host.
      </footer>
    </div>
  )
}
