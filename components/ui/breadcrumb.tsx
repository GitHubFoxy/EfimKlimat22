import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, {
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactElement,
} from 'react'
import { cn } from '@/lib/utils'

/**
 * Shadcn-style Breadcrumb components (typed)
 *
 * Usage:
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink asChild>
 *         <Link href="/">Home</Link>
 *       </BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/catalog">Catalog</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Item name</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */

/* Container for the entire breadcrumb nav */
export function Breadcrumb({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <nav aria-label='Breadcrumb' className={cn('text-sm', className)}>
      {children}
    </nav>
  )
}

/* Simple wrapper for the <ol> list */
export function BreadcrumbList({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <ol className={cn('flex items-center gap-2', className)}>{children}</ol>
  )
}

/* Individual breadcrumb item (<li>) */
export function BreadcrumbItem({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <li className={cn('flex items-center gap-2', className)}>{children}</li>
  )
}

type BreadcrumbLinkProps = {
  href?: string
  asChild?: boolean
  className?: string
} & PropsWithChildren<Record<string, unknown>> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>

/*
  BreadcrumbLink supports:
  - href: a string for a simple link (renders next/link)
  - asChild: when true, will clone the passed child element and apply classes (used for `asChild` pattern)
*/
export function BreadcrumbLink({
  href,
  asChild,
  children,
  className,
  ...rest
}: BreadcrumbLinkProps) {
  const baseClass =
    'text-gray-600 hover:text-gray-900 transition-colors text-sm flex items-center gap-2'

  // If asChild is set and the child is a valid React element, clone it with classes
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement
    // Merge className props safely; use any for cloned props to avoid TS issues with unknown child props
    const mergedProps: any = {
      ...(child.props as unknown as Record<string, any>),
      className: cn(baseClass, (child.props as any)?.className, className),
      ...(rest as unknown as Record<string, any>),
    }
    return cloneElement(child, mergedProps)
  }

  // If href provided, use next/link for client navigation
  if (href) {
    return (
      <Link href={href} className={cn(baseClass, className)} {...(rest as any)}>
        {children}
      </Link>
    )
  }

  // Fallback: render a plain span/a
  return (
    <a className={cn(baseClass, className)} {...(rest as any)}>
      {children}
    </a>
  )
}

/* Represents the current page (non-link) */
export function BreadcrumbPage({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      aria-current='page'
      className={cn('text-gray-900 font-medium text-sm', className)}
    >
      {children}
    </span>
  )
}

/* Separator between items; default uses a ChevronRight icon */
export function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex items-center text-gray-400', className)}
      role='presentation'
    >
      <ChevronRight size={16} />
    </span>
  )
}

export default {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
