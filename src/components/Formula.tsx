import katex from 'katex'

export function Formula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true })
  return (
    <div
      className="overflow-x-auto text-ink dark:text-[#f6f3ea]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function Symbols({ items }: { items: { sym: string; meaning: string }[] }) {
  return (
    <dl className="mt-3 grid gap-2">
      {items.map((item) => (
        <div key={item.sym} className="grid grid-cols-[5.5rem_1fr] gap-2 text-sm">
          <dt className="font-semibold text-sea">{item.sym}</dt>
          <dd className="text-ink/80 dark:text-[#d5e4de]">{item.meaning}</dd>
        </div>
      ))}
    </dl>
  )
}
