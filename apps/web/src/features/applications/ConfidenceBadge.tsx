interface Props {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: Props) {
  if (confidence >= 0.8) return null;
  if (confidence >= 0.5) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
        Please verify
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
      Low confidence — please verify
    </span>
  );
}
