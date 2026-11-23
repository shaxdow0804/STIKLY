export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border-[1.5px] border-dashed border-ink/40 bg-white px-6 py-14 text-center">
      {Icon && <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-ink bg-citrus shadow-hard"><Icon className="h-6 w-6" /></span>}
      <h3 className="text-xl font-bold">{title}</h3>
      {text && <p className="mt-2 text-ink/70">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
