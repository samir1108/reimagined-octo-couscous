"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, Cloud, CloudOff, RotateCcw, CheckCircle2, AlertCircle, HardDrive, Smartphone, Download } from "lucide-react";

interface OfflineSyncIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingCount: number;
  cachedItems: {
    theme: boolean;
    arc: boolean;
    sessions: boolean;
    guruAudio: boolean;
  };
  isSyncing: boolean;
}

export function OfflineSyncIndicator({
  className = "",
  showDetails = true,
}: OfflineSyncIndicatorProps) {
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSync: null,
    pendingCount: 0,
    cachedItems: { theme: false, arc: false, sessions: false, guruAudio: false },
    isSyncing: false,
  });
  const [expanded, setExpanded] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      syncNow();
    };
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Initial check
    checkCacheStatus();
    loadLastSyncTime();
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkCacheStatus = useCallback(async () => {
    try {
      const cacheNames = await caches.keys();
      const hasCache = cacheNames.length > 0;
      
      // Check specific caches
      const themeCache = await caches.open("theme-cache").catch(() => null);
      const arcCache = await caches.open("arc-cache").catch(() => null);
      const sessionsCache = await caches.open("sessions-cache").catch(() => null);
      const audioCache = await caches.open("audio-cache").catch(() => null);
      
      setStatus(prev => ({
        ...prev,
        cachedItems: {
          theme: !!themeCache,
          arc: !!arcCache,
          sessions: !!sessionsCache,
          guruAudio: !!audioCache,
        },
      }));
    } catch {
      // Ignore cache errors
    }
  }, []);

  const loadLastSyncTime = useCallback(async () => {
    try {
      const stored = localStorage.getItem("last-sync-time");
      if (stored) {
        setStatus(prev => ({ ...prev, lastSync: new Date(stored) }));
      }
      
      // Count pending operations from IndexedDB
      if ("indexedDB" in window) {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("consciousos-offline", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        const tx = db.transaction("pending-operations", "readonly");
        const store = tx.objectStore("pending-operations");
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          setStatus(prev => ({ ...prev, pendingCount: countRequest.result }));
        };
      }
    } catch {
      // Ignore
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!status.isOnline || status.isSyncing) return;
    
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Trigger service worker sync
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "SYNC_NOW" });
      }
      
      // Wait a bit for sync to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      localStorage.setItem("last-sync-time", now.toISOString());
      
      setStatus(prev => ({
        ...prev,
        lastSync: now,
        pendingCount: 0,
        isSyncing: false,
      }));
      
      checkCacheStatus();
    } catch {
      setStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [status.isOnline, status.isSyncing]);

  if (!showDetails) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${className}`}
        onClick={() => setExpanded(!expanded)}
      >
        <motion.div
          animate={{ 
            rotate: status.isSyncing ? 360 : 0,
            transition: { duration: 1, repeat: Infinity, ease: "linear" }
          }}
          className={`w-5 h-5 flex items-center justify-center ${
            status.isOnline ? "text-green" : "text-amber"
          }`}
        >
          {status.isOnline ? (
            <Wifi className="w-5 h-5" />
          ) : (
            <WifiOff className="w-5 h-5" />
          )}
        </motion.div>
        {status.pendingCount > 0 && (
          <motion.span
            initial={reducedMotion ? {} : { scale: 0 }}
            animate={reducedMotion ? {} : { scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {status.pendingCount > 9 ? "9+" : status.pendingCount}
          </motion.span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            status.isOnline ? "bg-green/20" : "bg-amber/20"
          }`}>
            {status.isOnline ? (
              <Wifi className="text-green w-5 h-5" />
            ) : (
              <WifiOff className="text-amber w-5 h-5" />
            )}
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Sync Status</h3>
            <p className="text-xs text-muted-foreground">
              {status.isOnline ? "Online" : "Offline"} · {status.pendingCount} pending · Last sync: {status.lastSync ? formatRelativeTime(status.lastSync) : "never"}
            </p>
          </div>
          <motion.button
            onClick={syncNow}
            disabled={!status.isOnline || status.isSyncing}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {status.isSyncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-5 h-5"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.div>
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
          </motion.button>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="p-4 bg-background/40 border border-border/30 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  status.isOnline ? "bg-green/20" : "bg-amber/20"
                }`}>
                  {status.isOnline ? (
                    <Wifi className="text-green w-5 h-5" />
                  ) : (
                    <WifiOff className="text-amber w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {status.isOnline ? "Online" : "Offline"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.isOnline 
                      ? "All features available" 
                      : "Using cached data · Changes will sync when online"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Cloud className="w-4 h-4" />
                  Last sync: {status.lastSync ? formatRelativeTime(status.lastSync) : "Never"}
                </span>
                {status.pendingCount > 0 && (
                  <span className="flex items-center gap-1 text-amber">
                    <AlertCircle className="w-4 h-4" />
                    {status.pendingCount} pending
                  </span>
                )}
              </div>
            </div>

            {/* Cached Data */}
            <div className="p-4 bg-background/40 border border-border/30 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Cached for Offline</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "theme", label: "Today's Theme", icon: Cloud },
                  { key: "arc", label: "Active Arc", icon: Cloud },
                  { key: "sessions", label: "30-Day Sessions", icon: Cloud },
                  { key: "guruAudio", label: "Guru Audio", icon: Smartphone },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2 p-2 bg-muted/30 border border-border/30 rounded-lg">
                    <item.icon className={`w-4 h-4 ${status.cachedItems[item.key as keyof typeof status.cachedItems] ? "text-green" : "text-muted-foreground"}`} />
                    <span className="text-xs text-foreground">{item.label}</span>
                    <span className={`text-xs ${status.cachedItems[item.key as keyof typeof status.cachedItems] ? "text-green" : "text-muted-foreground"}`}>
                      {status.cachedItems[item.key as keyof typeof status.cachedItems] ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                onClick={syncNow}
                disabled={!status.isOnline || status.isSyncing}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Sync Now</span>
              </motion.button>
              <button
                onClick={() => {}}
                className="p-3 bg-background/40 border border-border/30 rounded-xl hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export Data</span>
              </button>
            </div>

            {/* Storage Info */}
            <div className="pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground/70 text-center">
                💾 IndexedDB: Sessions, Whispers, Captures · ☁️ Service Worker: Theme, Arc, Audio
              </p>
            </div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

import { ChevronDown } from "lucide-react";