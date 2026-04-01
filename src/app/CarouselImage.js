import Image from "next/image";
import { useBlurDataURL } from "./useBlurDataURL";

export function CarouselImage({ src, width, height, alt }) {
    const { blurDataURL } = useBlurDataURL(src);

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            placeholder="blur"
            blurDataURL={blurDataURL}
        />
    );
}
