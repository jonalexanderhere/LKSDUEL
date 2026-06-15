export function AuthDivider({ label = 'or continue with' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-[#1A100C]" />
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-[#1A100C]" />
    </div>
  )
}

