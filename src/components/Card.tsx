import type { ReactNode } from 'react'

type CardProps = {
  id?: string
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Card({ id, title, children, footer, className }: CardProps) {
  return (
    <section id={id} className={`card ${className ?? ''}`.trim()}>
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </section>
  )
}
