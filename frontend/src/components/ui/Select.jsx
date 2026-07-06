export default function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-cortex-muted font-medium">{label}</label>}
      <select
        {...props}
        className="cortex-input w-full"
      >
        <option value="">Selecione...</option>
        {options.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
    </div>
  );
}
