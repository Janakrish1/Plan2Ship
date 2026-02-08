import { getMetricsChartUrl } from "../services/api";
import { useImageLightbox } from "./ImageLightbox";

interface MetricsChartFigureProps {
  projectId: string;
  filename: string;
}

/**
 * Wraps a metrics chart image in a consistent container so pie charts and
 * bar charts are visible and properly aligned. Click to open in lightbox.
 */
export function MetricsChartFigure({ projectId, filename }: MetricsChartFigureProps) {
  const { openLightbox } = useImageLightbox();
  const src = getMetricsChartUrl(projectId, filename);
  const alt = filename.replace(".png", "").replace(/-/g, " ");

  return (
    <figure className="flex flex-col items-center rounded-lg border border-white/10 overflow-hidden bg-card/40 p-2 min-h-[220px] w-full max-w-md mx-auto">
      <div className="relative w-full flex-1 min-h-[180px] flex items-center justify-center cursor-pointer group">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain max-h-[260px] transition-transform group-hover:scale-[1.02]"
          loading="lazy"
          onClick={() => openLightbox(src, alt)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(src, alt)}
        />
      </div>
      <figcaption className="text-xs text-muted-foreground mt-1 text-center truncate w-full px-1">
        {alt} (click to enlarge)
      </figcaption>
    </figure>
  );
}
