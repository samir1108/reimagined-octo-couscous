export default function SessionCTA({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-[0_0_20px_hsl(var(--primary)/0.4)] disabled:opacity-50"
      >
        Hold Orb to Begin Session
      </button>
    </div>
  );
}
