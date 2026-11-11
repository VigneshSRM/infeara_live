"use client";

import { useState } from "react";
import { figureImage } from "@/lib/site-images";

/**
 * Picks one of the site's built-in photographs by number, and shows the picture the number gives.
 * The same number always gives the same photograph, on every page that uses it.
 */
export function FigureSeedField({
  name = "figure_seed",
  label = "Picture number",
  defaultValue,
  hint = "Any whole number picks one of the site's built-in photographs. Try a few and watch the preview.",
}: {
  name?: string;
  label?: string;
  defaultValue: number;
  hint?: string;
}) {
  const [value, setValue] = useState(String(defaultValue));
  const parsed = Number.parseInt(value, 10);
  const image = figureImage(Number.isFinite(parsed) ? parsed : 1);

  return (
    <div className="flex flex-wrap items-start gap-4 sm:col-span-2">
      <div className="w-full max-w-[14rem] flex-1">
        <label className="admin-label" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type="number"
          step={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="admin-input"
        />
        <p className="mt-1 text-[0.74rem] leading-relaxed text-charcoal/60">{hint}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small preview of a file in /public */}
      <img
        src={image.src}
        alt={image.alt}
        width={192}
        height={108}
        loading="lazy"
        className="h-[108px] w-[192px] border border-navy/10 object-cover"
      />
    </div>
  );
}
