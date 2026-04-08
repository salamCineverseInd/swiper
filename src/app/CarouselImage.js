import Image from "next/image";
import { useBlurDataURL } from "./useBlurDataURL";

export function CarouselImage({ src, alt }) {
    const { blurDataURL } = useBlurDataURL(src);

    return (
        <Image
            fill
            src={src}
            alt={alt}
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="(max-width: 768px) 100vw, 33vw"
        />
    );
}
