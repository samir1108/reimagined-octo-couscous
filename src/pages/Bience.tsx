import Seo from "@/components/seo/Seo";
import BienceStudio from "@/components/bience/BienceStudio";

export default function Bience() {
  return (
    <>
      <Seo
        title="Bience — ambient worlds for sitting, sleeping and working"
        description="Build a living soundscape from rain, fire, tanpura, bells and night air. Every sound is synthesised in your browser — no streaming, no downloads."
        canonicalPath="/bience"
      />
      <BienceStudio />
    </>
  );
}
