export default function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-gray-400 font-medium">{label}</label>
      )}
      <select
        {...props}
        className="bg-brand-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-accent transition-colors"
      >
        <option value="">Selecione...</option>
        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}
