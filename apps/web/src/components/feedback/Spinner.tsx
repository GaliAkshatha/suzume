export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}
