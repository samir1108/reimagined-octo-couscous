import { useState, useEffect } from "react";

export default function GreetingIdentity({ streak = 3, day = 7 }) {
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-display font-medium">Welcome back</p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>🌅</span> Day {day} • Streak {streak}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">05:06 PM</p>
          <p className="text-xs text-muted-foreground">Abhijit Muhurta</p>
        </div>
      </div>
    </div>
  );
}
