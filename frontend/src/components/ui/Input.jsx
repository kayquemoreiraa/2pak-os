export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-cortex-muted font-medium">{label}</label>}
      <input
        {...props}
        className="cortex-input w-full"
      />
    </div>
  );
}
