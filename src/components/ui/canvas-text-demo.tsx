"use client";
import { cn } from "@/lib/utils";
import { CanvasText } from "@/components/ui/canvas-text";

export function CanvasTextDemo() {
  return (
    <div className="flex min-h-0 items-center justify-center py-2">
      <h2
        className={cn(
          "group relative mx-auto mt-0 max-w-2xl text-center text-4xl leading-20 font-bold tracking-tight text-balance text-neutral-600 sm:text-5xl md:text-6xl xl:text-7xl dark:text-neutral-700",
        )}
      >
        Turning Problems into{" "}
        <CanvasText
          text="Possibilities"
          backgroundClassName="bg-yellow-700 dark:bg-yellow-800"
          colors={[
            "rgba(255, 200, 0, 1)",
            "rgba(255, 200, 0, 0.9)",
            "rgba(255, 200, 0, 0.8)",
            "rgba(255, 200, 0, 0.7)",
            "rgba(255, 200, 0, 0.6)",
            "rgba(255, 200, 0, 0.5)",
            "rgba(255, 200, 0, 0.4)",
            "rgba(255, 200, 0, 0.3)",
            "rgba(255, 200, 0, 0.2)",
            "rgba(255, 200, 0, 0.1)",
          ]}
          lineGap={4}
          animationDuration={20}
        />
      </h2>
    </div>
  );
}
