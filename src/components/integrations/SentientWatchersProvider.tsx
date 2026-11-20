/**
 * Mounts background device watchers based on per-source consent.
 * Place once high in the tree (e.g., inside authenticated app shell).
 */
import { useSignalConsents } from "@/hooks/useSignalConsents";
import { usePhonePickups } from "@/hooks/usePhonePickups";
import { useTypingCadence } from "@/hooks/useTypingCadence";

export default function SentientWatchersProvider() {
  const { consents } = useSignalConsents();
  const pickups = consents["android_usage"]?.enabled || consents["ios_screentime"]?.enabled;
  const typing = consents["keyboard_cadence"]?.enabled;
  usePhonePickups(!!pickups);
  useTypingCadence(!!typing);
  return null;
}
