export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-32" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[100px]" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[80px]" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[100px]" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
