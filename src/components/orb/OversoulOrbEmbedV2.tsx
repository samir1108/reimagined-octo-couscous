interface OversoulOrbEmbedProps {
  className?: string;
  currentGate?: unknown;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
}

export default function OversoulOrbEmbed({
  className = "",
}: OversoulOrbEmbedProps) {
  return (
    <iframe
      src="/oversoul-orb.html"
      title="Oversoul orb"
      className={`aspect-square w-full ${className} border-0`}
      sandbox="allow-scripts allow-same-origin allow-camera allow-microphone"
      allow="camera; microphone"
      loading="eager"
    />
  );
}
