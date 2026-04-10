export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-crop-700">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
