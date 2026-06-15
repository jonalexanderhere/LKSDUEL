import Link from 'next/link'

interface AuthFooterProps {
  text: string
  href: string
  linkText: string
}

export function AuthFooter({ text, href, linkText }: AuthFooterProps) {
  return (
    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
      {text}{' '}
      <Link
        href={href}
        className="font-semibold text-amber-700 dark:text-amber-500 transition-colors hover:text-amber-600 dark:text-amber-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {linkText}
      </Link>
    </p>
  )
}

