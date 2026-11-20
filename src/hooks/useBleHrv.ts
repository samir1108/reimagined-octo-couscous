/**
 * Web Bluetooth HRV from BLE chest straps (Polar H10, Movesense, etc.)
 * Reads RR intervals from the standard Heart Rate Service (0x180D),
 * computes RMSSD over a rolling 60s window, and emits HRV samples.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const HR_SERVICE = 0x180d;
const HR_MEASUREMENT = 0x2a37;

interface HrvState {
  connected: boolean;
  bpm: number | null;
  rmssd: number | null;
  coherence: number; // 0-1 derived from rmssd stability
  error: string | null;
}

export function useBleHrv() {
  const [state, setState] = useState<HrvState>({
    connected: false,
    bpm: null,
    rmssd: null,
    coherence: 0,
    error: null,
  });
  const deviceRef = useRef<any>(null);
  const rrBufferRef = useRef<number[]>([]); // ms
  const lastIngestRef = useRef<number>(0);

  const ingestHrv = useCallback(async (rmssd: number) => {
    const now = Date.now();
    if (now - lastIngestRef.current < 30_000) return; // throttle to 30s
    lastIngestRef.current = now;
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      await supabase.functions.invoke("ingest-signal", {
        body: {
          points: [
            {
              layer: "bio",
              source: "polar_ble",
              metric: "hrv_rmssd",
              value: Math.round(rmssd),
              unit: "ms",
            },
          ],
        },
      });
    } catch {
      /* silent */
    }
  }, []);

  const handleHrMeasurement = useCallback(
    (event: any) => {
      const value: DataView = event.target.value;
      const flags = value.getUint8(0);
      const is16 = flags & 0x1;
      let offset = 1;
      const bpm = is16 ? value.getUint16(offset, true) : value.getUint8(offset);
      offset += is16 ? 2 : 1;
      // Energy expended skip
      if (flags & 0x8) offset += 2;
      // RR present
      const rrs: number[] = [];
      if (flags & 0x10) {
        while (offset + 1 < value.byteLength) {
          const rr1024 = value.getUint16(offset, true);
          rrs.push((rr1024 / 1024) * 1000); // → ms
          offset += 2;
        }
      }
      if (rrs.length) {
        rrBufferRef.current.push(...rrs);
        // Keep last ~60s of beats (avg HR 60 → ~60 RRs)
        if (rrBufferRef.current.length > 120) {
          rrBufferRef.current = rrBufferRef.current.slice(-120);
        }
      }
      const buf = rrBufferRef.current;
      let rmssd: number | null = null;
      if (buf.length > 5) {
        let sumSq = 0;
        for (let i = 1; i < buf.length; i++) {
          const d = buf[i] - buf[i - 1];
          sumSq += d * d;
        }
        rmssd = Math.sqrt(sumSq / (buf.length - 1));
      }
      // Coherence: invert recent variance (more rhythmic = higher coherence)
      let coherence = 0;
      if (rmssd !== null) {
        coherence = Math.max(0, Math.min(1, (rmssd - 10) / 80));
        ingestHrv(rmssd);
      }
      setState((s) => ({ ...s, bpm, rmssd, coherence, connected: true }));
    },
    [ingestHrv],
  );

  const connect = useCallback(async () => {
    try {
      const nav: any = navigator;
      if (!nav.bluetooth) throw new Error("Web Bluetooth not supported in this browser");
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE] }],
        optionalServices: [HR_SERVICE],
      });
      deviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(HR_SERVICE);
      const char = await service.getCharacteristic(HR_MEASUREMENT);
      char.addEventListener("characteristicvaluechanged", handleHrMeasurement);
      await char.startNotifications();
      setState((s) => ({ ...s, connected: true, error: null }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? "BLE connect failed" }));
    }
  }, [handleHrMeasurement]);

  const disconnect = useCallback(() => {
    try {
      deviceRef.current?.gatt?.disconnect();
    } catch {
      /* ignore */
    }
    setState({ connected: false, bpm: null, rmssd: null, coherence: 0, error: null });
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return { ...state, connect, disconnect };
}
