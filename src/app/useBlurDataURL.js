"use client";

import { useState, useEffect } from "react";

const DEFAULT_BLUR_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const cache = new Map();

export function useBlurDataURL(src, options = {}) {
    const { size = 8, format = "image/webp", quality = 0.5 } = options;

    const [blurDataURL, setBlurDataURL] = useState(
        () => cache.get(src) || DEFAULT_BLUR_DATA_URL,
    );
    const [isLoading, setIsLoading] = useState(!cache.has(src));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!src) return;

        if (cache.has(src)) {
            setBlurDataURL(cache.get(src));
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            if (cancelled) return;

            const aspect = img.naturalWidth / img.naturalHeight;
            const w =
                aspect >= 1 ? size : Math.max(1, Math.round(size * aspect));
            const h =
                aspect < 1 ? size : Math.max(1, Math.round(size / aspect));

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                setError(new Error("Canvas 2D context not available"));
                setIsLoading(false);
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, w, h);

            const dataUrl =
                format === "image/png"
                    ? canvas.toDataURL("image/png")
                    : canvas.toDataURL(format, quality);

            cache.set(src, dataUrl);
            setBlurDataURL(dataUrl);
            setIsLoading(false);
        };

        img.onerror = () => {
            if (cancelled) return;
            setError(new Error(`Failed to load image: ${src}`));
            setBlurDataURL(DEFAULT_BLUR_DATA_URL);
            setIsLoading(false);
        };

        img.src = src;

        return () => {
            cancelled = true;
            img.onload = null;
            img.onerror = null;
        };
    }, [src, size, format, quality]);

    return { blurDataURL, isLoading, error };
}
