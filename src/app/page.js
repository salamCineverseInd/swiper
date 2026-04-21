"use client";

import styled from "styled-components";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("./Carousel"));

const items = [
    "Romance",
    "Sci-Fi & Fantasy",
    "True Crime",
    "Mystery",
    "Biography",
    "History",
    "Self-Help",
    "Horror",
    "Thriller",
];

export default function page() {
    return (
        <div>
            <Carousel>
                {items.map((item) => (
                    <h1 key={item}>{item}</h1>
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
