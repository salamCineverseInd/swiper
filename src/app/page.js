"use client";

import Carousel from "./Carousel";
import { CarouselImage } from "./CarouselImage";
import styled from "styled-components";
import { items } from "./items";
import ShelfCard from "./ShelfCard";

export default function page() {
    return (
        <div>
            <Carousel>
                {items.slice(0, 3).map((item) => (
                    <ShelfCard key={item.id} item={item}>
                        <CarouselImageContainer>
                            <CarouselImage
                                src={item.promo_thumbnail_port}
                                alt={`${item.title} poster`}
                            />
                        </CarouselImageContainer>
                    </ShelfCard>
                ))}
            </Carousel>
            <Carousel>
                {items.map((item) => (
                    <ShelfCard key={item.id} item={item}>
                        <CarouselImageContainer>
                            <CarouselImage
                                src={item.promo_thumbnail_port}
                                alt={`${item.title} poster`}
                            />
                        </CarouselImageContainer>
                    </ShelfCard>
                ))}
            </Carousel>
            <Carousel>
                {items.slice(3, 4).map((item) => (
                    <ShelfCard key={item.id} item={item}>
                        <CarouselImageContainer>
                            <CarouselImage
                                src={item.promo_thumbnail_port}
                                alt={`${item.title} poster`}
                            />
                        </CarouselImageContainer>
                    </ShelfCard>
                ))}
            </Carousel>
        </div>
    );
}

const CarouselImageContainer = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    pointer-events: none;
    user-select: none;
`;
