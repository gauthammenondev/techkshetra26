import type React from 'react'
import { forwardRef } from 'react'
import styles from './css/PageTitle.module.css'

type PageTitleProps = {
  readonly children: React.ReactNode
  readonly isOutgoing?: boolean
}

export const PageTitle = forwardRef<HTMLDivElement, PageTitleProps>(
  ({ children, isOutgoing }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`${styles.container} ${isOutgoing ? styles.outgoing : styles.incoming}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </div>
    )
  }
)
PageTitle.displayName = 'PageTitle'
