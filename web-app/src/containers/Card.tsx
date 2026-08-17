import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type CardProps = {
  title?: string
  children?: ReactNode
  header?: ReactNode
  className?: string
}

type CardItemProps = {
  title?: string | ReactNode
  description?: string | ReactNode
  descriptionOutside?: string | ReactNode
  align?: 'start' | 'center' | 'end'
  actions?: ReactNode
  column?: boolean
  className?: string
  classNameWrapperAction?: string
}

export function CardItem({
  title,
  description,
  descriptionOutside,
  className,
  classNameWrapperAction,
  align = 'center',
  column,
  actions,
}: CardItemProps) {
  return (
    <>
      <div
        className={cn(
          'flex flex-col items-stretch justify-between mt-2 first:mt-0 border-b border-border/40 pb-3 last:border-none last:pb-0 gap-3 md:flex-row md:gap-8',
          descriptionOutside && 'border-0',
          align === 'start' && 'md:items-start',
          align === 'center' && 'md:items-center',
          align === 'end' && 'md:items-end',
          column && 'flex-col gap-y-0 items-start',
          className
        )}
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <h1 className="break-words font-medium text-foreground">{title}</h1>
          {description && (
            <span className="block min-w-0 break-words text-muted-foreground leading-normal [&_a]:break-all">
              {description}
            </span>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              'max-w-full min-w-0 shrink-0',
              classNameWrapperAction,
              column && 'w-full'
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {descriptionOutside && (
        <span className="block min-w-0 break-words text-muted-foreground leading-normal [&_a]:break-all">
          {descriptionOutside}
        </span>
      )}
    </>
  )
}

export function Card({ title, children, header, className }: CardProps) {
  return (
    <div
      className={cn(
        'p-4 text-muted-foreground w-full',
        !className && 'bg-card rounded-lg',
        className
      )}
    >
      {title && (
        <h1 className="text-foreground font-studio font-medium text-base mb-4">
          {title}
        </h1>
      )}
      {header && header}
      {children}
    </div>
  )
}
