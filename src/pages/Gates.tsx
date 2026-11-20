import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AppLayout from "@/components/AppLayout";

export default function Gates() {
  useEffect(() => {
    document.title = "Gates — ConsciousOS";
  }, []);

  return (
    <>
      <Helmet>
        <title>Gates — ConsciousOS</title>
        <meta name="description" content="The Gates of Consciousness" />
      </Helmet>
        <div className="flex min-h-[calc(100dvh-var(--nav-height))] flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Gates
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md">
            The Gates of Consciousness — Coming Soon
          </p>
        </div>
    </>
  );
}