"use client";

import styled from "styled-components";
import React, { useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

const DURATION = 300;
const TRANSITION = `transform ${DURATION}ms ease-in-out`;
const BREAKPOINT = 640;
const ARROW_WIDTH = 80;
const ITEMS = [
    "Romance",
    "Sci-Fi & Fantasy",
    "True Crime",
    "Mystery",
    "Biography",
    "History",
];

export default function TextCarousel({ items = ITEMS, loading = 0 }) {
    const n = items.length;
    const tripled = useMemo(() => [...items, ...items, ...items], [items]);

    const tracksRef = useRef({ left: null, center: null, right: null });
    const slotWidthRef = useRef(0);
    const indexRef = useRef(n);
    const isAnimating = useRef(false);

    const wrapperRef = useRef(null);
    const outerLeftRef = useRef(null);
    const outerRightRef = useRef(null);

    const getOffset = useCallback(
        (index) => -(index * slotWidthRef.current),
        [],
    );

    const setTranslate = useCallback((track, px, withTransition) => {
        if (!track) return;
        track.style.transition = withTransition ? TRANSITION : "none";
        track.style.transform = `translate3d(${px}px,0,0.001px)`;
    }, []);

    const updateAll = useCallback(
        (withTransition) => {
            const { left, center, right } = tracksRef.current;
            setTranslate(left, getOffset(indexRef.current - 1), withTransition);
            setTranslate(center, getOffset(indexRef.current), withTransition);
            setTranslate(
                right,
                getOffset(indexRef.current + 1),
                withTransition,
            );
        },
        [getOffset, setTranslate],
    );

    const updateActive = useCallback(() => {
        Object.values(tracksRef.current).forEach((track) => {
            if (!track) return;
            track.querySelectorAll("[data-item]").forEach((el, i) => {
                el.setAttribute(
                    "data-active",
                    i % n === indexRef.current % n ? "true" : "false",
                );
            });
        });
    }, [n]);

    const slide = useCallback(
        (dir) => {
            if (isAnimating.current) return;
            isAnimating.current = true;
            indexRef.current += dir;
            updateAll(true);
            updateActive();
        },
        [updateAll, updateActive],
    );

    useEffect(() => {
        const center = tracksRef.current.center;
        if (!center) return;

        const handleEnd = (e) => {
            if (e.propertyName !== "transform") return;

            if (indexRef.current >= n * 2) {
                indexRef.current -= n;
            } else if (indexRef.current < n) {
                indexRef.current += n;
            }

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateAll(false);
                    updateActive();
                    isAnimating.current = false;
                });
            });
        };

        center.addEventListener("transitionend", handleEnd);
        return () => center.removeEventListener("transitionend", handleEnd);
    }, [n, updateAll, updateActive]);

    const build = useCallback(() => {
        const containerWidth = wrapperRef.current?.clientWidth ?? 0;
        if (containerWidth === 0) return;

        const isSmall = containerWidth < BREAKPOINT;
        const slotW = isSmall
            ? containerWidth
            : (containerWidth - ARROW_WIDTH) / 3;

        if (Math.abs(slotW - slotWidthRef.current) < 1) return;

        slotWidthRef.current = slotW;

        // Note: The manual JS inline styling for outerLeft/outerRight has been removed from here.

        Object.values(tracksRef.current).forEach((track) => {
            if (!track) return;
            track.innerHTML = "";
            tripled.forEach((text) => {
                const el = document.createElement("div");
                el.className = "carousel-item";
                el.setAttribute("data-item", "true");
                el.setAttribute("data-active", "false");
                el.style.width = `${slotW}px`;

                if (loading) {
                    const skeleton = document.createElement("div");
                    skeleton.className = "carousel-skeleton";
                    el.appendChild(skeleton);
                } else {
                    el.textContent = text;
                }

                track.appendChild(el);
            });
        });

        updateAll(false);
        updateActive();
    }, [tripled, updateAll, updateActive, loading]);

    useEffect(() => {
        const observer = new ResizeObserver(build);
        if (wrapperRef.current) observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, [build]);

    return (
        <Wrapper ref={wrapperRef}>
            <SideOuter ref={outerLeftRef}>
                <Track ref={(el) => (tracksRef.current.left = el)} />
            </SideOuter>

            <ArrowButton onClick={() => slide(-1)} aria-label="Previous">
                <Image
                    src="/arrowPrev.svg"
                    alt="prev button"
                    width={30}
                    height={30}
                />
            </ArrowButton>

            <Outer style={{ flex: 1 }}>
                <Track ref={(el) => (tracksRef.current.center = el)} />
            </Outer>

            <ArrowButton onClick={() => slide(1)} aria-label="Next">
                <Image
                    src="/arrowNext.svg"
                    alt="next button"
                    width={30}
                    height={30}
                />
            </ArrowButton>

            <SideOuter ref={outerRightRef}>
                <Track ref={(el) => (tracksRef.current.right = el)} />
            </SideOuter>

            <GlobalStyle />
        </Wrapper>
    );
}

const GlobalStyle = () => (
    <style>{`
        @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }

        .carousel-item {
            flex-shrink: 0;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            font-family: 'Open Sans', sans-serif;
            text-transform: uppercase;
            color: rgba(255,255,255,0.35);
            line-height: 1.4;
            white-space: normal;
            overflow: visible;
            word-break: break-word;
            box-sizing: border-box;
            padding: 4px 16px;
            transition: color 500ms ease;
            will-change: transform;
        }
        .carousel-item[data-active="true"] {
            color: rgba(255,255,255,1);
        }

        .carousel-skeleton {
            width: 60%;
            height: 25px;
            border-radius: 6px;
            background: linear-gradient(
                90deg,
                rgba(255,255,255,0.08) 25%,
                rgba(255,255,255,0.18) 50%,
                rgba(255,255,255,0.08) 75%
            );
            background-size: 400px 100%;
            animation: shimmer 1.4s infinite linear;
            margin-inline: auto;
        }
    `}</style>
);

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
    min-height: 100vh;
    background-color: #000;
    position: relative;

    @media (max-width: 639px) {
        padding: 2rem 0;
    }
`;

const Outer = styled.div`
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
`;

const SideOuter = styled(Outer)`
    @media (max-width: 639px) {
        flex: 0 0 0px;
        width: 0px;
    }
`;

const Track = styled.div`
    display: flex;
    align-items: center;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
`;

const ArrowButton = styled.button`
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    z-index: 2;
    transition: opacity 150ms;

    @media (max-width: 639px) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);

        &:first-of-type {
            left: 1rem;
        }
        &:last-of-type {
            right: 1rem;
        }

        &:active {
            transform: translateY(-50%) scale(0.92);
        }
    }

    &:hover {
        opacity: 0.6;
    }
`;
