"use client";
import { useEffect } from "react";

/**
 * Register the service worker for offline support and predictive preloading
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      console.log("[SW] Service Worker registered:", registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update().catch(console.error);
      }, 60 * 60 * 1000); // Every hour

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available, notify user
              console.log("[SW] New version available");
              // Could dispatch a custom event here for UI notification
            }
          });
        }
      });

      return registration;
    })
    .catch((error) => {
      console.error("[SW] Registration failed:", error);
      return null;
    });
}

/**
 * Hook to register service worker on mount
 */
export function useServiceWorker(): ServiceWorkerRegistration | null {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let mounted = true;

    registerServiceWorker().then((reg) => {
      if (mounted) setRegistration(reg);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return registration;
}

import { useState } from "react";

/**
 * Request a predictive preload now (e.g., when user opens app)
 */
export function requestPreload(): Promise<void> {
  return new Promise((resolve) => {
    if (!navigator.serviceWorker.controller) {
      resolve();
      return;
    }

    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();

    navigator.serviceWorker.controller.postMessage("preloadNow", [channel.port2]);

    // Timeout fallback
    setTimeout(resolve, 5000);
  });
}

/**
 * Check if app is running offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return isOnline;
}