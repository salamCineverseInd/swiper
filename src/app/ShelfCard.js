"use client";

import { useRef, useState, useCallback } from "react";
import styled from "styled-components";
import HoverCard from "./HoverCard";
import { CarouselImage } from "./CarouselImage";
import Image from "next/image";

const SCALE = 1.5;
const ENTER_DELAY = 300;
const LEAVE_DELAY = 300;

function formatDuration(ms) {
    let result = "";
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours) result += `${hours}h `;
    if (minutes) result += `${minutes}m `;
    if (seconds && !hours) result += `${seconds}s`;

    return result.trim() || "0s";
}

export default function ShelfCard({ children, item }) {
    const cardRef = useRef(null);
    const enterTimerRef = useRef(null);
    const [anchorRect, setAnchorRect] = useState(null);
    const [position, setPosition] = useState("center");
    const [isLeaving, setIsLeaving] = useState(false);
    const leaveTimerRef = useRef(null);

    const handleMouseEnter = useCallback(() => {
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }

        const el = cardRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const expandedWidth = rect.width * SCALE;
        const overflow = (expandedWidth - rect.width) / 2;

        if (rect.left < overflow) {
            setPosition("left");
        } else if (rect.right + overflow > window.innerWidth) {
            setPosition("right");
        } else {
            setPosition("center");
        }

        enterTimerRef.current = setTimeout(() => {
            setIsLeaving(false);
            setAnchorRect(rect);
        }, ENTER_DELAY);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (enterTimerRef.current) {
            clearTimeout(enterTimerRef.current);
            enterTimerRef.current = null;
        }

        setIsLeaving(true);
        leaveTimerRef.current = setTimeout(() => {
            setAnchorRect(null);
            setIsLeaving(false);
        }, LEAVE_DELAY);
    }, []);

    return (
        <Wrapper
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <HoverCard
                position={position}
                anchorRect={anchorRect}
                isLeaving={isLeaving}
            >
                <CarouselImageContainer>
                    <CarouselImage
                        src={item.promo_thumbnail_port}
                        alt={item.title}
                    />
                </CarouselImageContainer>

                <Content>
                    <TopRow>
                        <PlayButtonContainer>
                            <PlayButton>
                                <Image
                                    src="/play_svg.svg"
                                    alt="play button"
                                    width={30}
                                    height={30}
                                />
                            </PlayButton>
                            <p>Play</p>
                        </PlayButtonContainer>
                        <IconButtonContainer>
                            <IconButton>
                                <Image
                                    src="/addicon.svg"
                                    alt="add icon"
                                    width={30}
                                    height={30}
                                />
                            </IconButton>
                            <IconButton>
                                <Image
                                    src="/infoicon.svg"
                                    alt="add icon"
                                    width={30}
                                    height={30}
                                />
                            </IconButton>
                        </IconButtonContainer>
                    </TopRow>
                    <Meta>
                        <Duration>{formatDuration(item.duration)}</Duration>
                        <VerticalLine />
                        <Year>{item.pub_year}</Year>
                        <RatingContainer>
                            {item.rating_code &&
                                item.rating_code
                                    .split(",")
                                    .map((r) => (
                                        <Rating key={r.trim()}>
                                            {r.trim()}
                                        </Rating>
                                    ))}
                        </RatingContainer>
                    </Meta>
                    <Description>{item.small_description}</Description>
                </Content>
            </HoverCard>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
`;

const CarouselImageContainer = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    pointer-events: none;
    user-select: none;
`;

const Content = styled.div`
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: #1a1a1a;
    font-family: sans-serif;
`;

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
`;

const PlayButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    p {
        color: #fff;
        font-size: 1.1rem;
        margin: 0;
    }
`;

const PlayButton = styled.button`
    background: none;
    outline: none;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: #19b589;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`;

const IconButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
`;

const IconButton = styled.button`
    all: unset;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 150ms ease;

    &:hover {
        border-color: rgba(255, 255, 255, 0.6);
    }

    & img {
        margin: 0;
    }

    & img:hover {
        filter: brightness(0) saturate(100%) invert(70%) sepia(47%)
            saturate(496%) hue-rotate(118deg) brightness(95%) contrast(90%);
    }
`;

const Meta = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const VerticalLine = styled.div`
    width: 1px;
    height: 10px;
    background-color: #fff;
`;

const Duration = styled.span`
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
`;

const Year = styled.span`
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
`;

const RatingContainer = styled.div`
    margin-left: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Rating = styled.span`
    font-size: 0.65rem;
    font-weight: 700;
    color: #fff;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
`;

const Description = styled.p`
    margin: 0;
    font-size: 0.78rem;
    color: #b1b1b1;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;
