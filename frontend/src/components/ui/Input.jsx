export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-gray-400 font-medium">{label}</label>
      )}
      <input
        {...props}
        className="bg-brand-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-accent transition-colors"
      />
    </div>
  );
}
