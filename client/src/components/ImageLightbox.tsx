import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

type ImageLightboxContextValue = {
  openLightbox: (src: string, alt?: string) => void;
};

const ImageLightboxContext = createContext<ImageLightboxContextValue | null>(null);

export function useImageLightbox() {
  const ctx = useContext(ImageLightboxContext);
  return ctx ?? { openLightbox: () => {} };
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const openLightbox = useCallback((imageSrc: string, imageAlt = "") => {
    setSrc(imageSrc);
    setAlt(imageAlt);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSrc(null);
    setAlt("");
  }, []);

  return (
    <ImageLightboxContext.Provider value={{ openLightbox }}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] p-0 gap-0 bg-black/95 border-white/20 overflow-hidden flex flex-col"
          onPointerDownOutside={close}
          onEscapeKeyDown={close}
        >
          <DialogTitle className="sr-only">{alt || "Enlarged view"}</DialogTitle>
          {/* Fixed header so close button is always visible */}
          <div className="flex-none flex justify-end items-center p-3 border-b border-white/10">
            <button
              type="button"
              onClick={close}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close"
            >
              <X className="h-5 w-5 shrink-0" />
            </button>
          </div>
          {src && (
            <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[calc(90vh-5rem)] w-auto h-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ImageLightboxContext.Provider>
  );
}
