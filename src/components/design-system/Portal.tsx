"use client";

import { useEffect, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const target = container ?? document.body;

  return ReactDOM.createPortal(children, target);
}