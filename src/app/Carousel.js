"use client";

import Image from "next/image";
import React, {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from "react";
import styled from "styled-components";

const DURATION = 500;
const TRANSITION = `transform ${DURATION}ms cubic-bezier(.36,1.31,.64,1)`;

function getVisibleCount(width) {
    if (width < 480) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    if (width < 1280) return 5;
    return 6;
}

export default function Carousel({
    children,
    loop = true,
    gap = 16,
    peekSize = 20,
    autoScroll = false,
    autoScrollSpeed = 0.05,
    scrollDirection = "right",
    background = "#000",
}) {
    const data = React.Children.toArray(children);
    const currentPosRef = useRef(0);
    const [atStart, setAtStart] = useState(false);
    const [atEnd, setAtEnd] = useState(false);

    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const pointerTypeRef = useRef("mouse");

    const viewportRef = useRef(null);
    const indexRef = useRef(loop ? data.length : 0);
    const isAnimating = useRef(false);

    const [initialLoad, setInitialLoad] = useState(true);

    const startX = useRef(0);
    const isDragging = useRef(false);
    const dragOffset = useRef(0);

    const velocityRef = useRef(0);
    const lastMoveTime = useRef(0);
    const lastX = useRef(0);

    const [isReady, setIsReady] = useState(false);
    const [visible, setVisible] = useState(5);
    const [cardWidth, setCardWidth] = useState(260);
    const canScroll = data.length > visible;

    const autoScrollAccRef = useRef(0);
    const autoScrollPausedRef = useRef(false);

    const STEP = cardWidth + gap;

    const items = useMemo(() => {
        return canScroll && loop ? [...data, ...data, ...data] : data;
    }, [data, canScroll, loop]);

    const getOffset = useCallback(
        (index) => -(index * STEP) + peekSize,
        [STEP],
    );

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let timeoutId = null;

        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;

            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                const v = getVisibleCount(width);
                const totalGap = (v - 1) * gap;
                const cardW = (width - totalGap - peekSize * 2) / v;

                if (trackRef.current) {
                    trackRef.current.style.transition = "none";
                }

                setVisible(v);
                setCardWidth(cardW);

                requestAnimationFrame(() => {
                    setTranslate(getOffset(indexRef.current), false);
                    requestAnimationFrame(() => {
                        if (!isReady) setIsReady(true);
                    });
                });
            }, 100);
        });

        observer.observe(el);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [getOffset, isReady]);

    function setTranslate(px, withTransition) {
        const el = trackRef.current;
        if (!el) return;

        el.style.transition = withTransition ? TRANSITION : "none";
        el.style.transform = `translate3d(${px}px,0,0)`;
    }

    const slide = useCallback(
        (steps) => {
            if (!canScroll || isAnimating.current) return;
            if (steps !== 0) {
                setInitialLoad(false);
            }

            isAnimating.current = true;
            indexRef.current += steps;

            if (!loop) {
                indexRef.current = Math.max(
                    0,
                    Math.min(indexRef.current, data.length - 1),
                );
            }

            const pos =
                ((indexRef.current % data.length) + data.length) % data.length;
            currentPosRef.current = pos;

            if (!loop) {
                setAtStart(pos === 0);
                setAtEnd(pos >= data.length - visible);
            }

            setTranslate(getOffset(indexRef.current), true);

            setTimeout(() => {
                if (loop) {
                    const total = data.length;
                    if (indexRef.current >= total * 2) {
                        indexRef.current -= total;
                        setTranslate(getOffset(indexRef.current), false);
                    } else if (indexRef.current < total) {
                        indexRef.current += total;
                        setTranslate(getOffset(indexRef.current), false);
                    }
                }
                isAnimating.current = false;
            }, DURATION);
        },
        [getOffset, loop, data.length, visible],
    );

    function onPointerDown(e) {
        if (isAnimating.current) return;
        if (e.pointerType === "mouse" && window.innerWidth > 768) return;

        pointerTypeRef.current = e.pointerType;

        isDragging.current = true;
        startX.current = e.clientX;
        lastX.current = e.clientX;
        lastMoveTime.current = Date.now();
        velocityRef.current = 0;

        e.currentTarget.setPointerCapture(e.pointerId);

        trackRef.current.style.transition = "none";
        dragOffset.current = 0;
        autoScrollPausedRef.current = true;
    }

    function onPointerMove(e) {
        if (!isDragging.current) return;
        if (e.pointerType === "mouse" && window.innerWidth > 768) return;

        const DRAG_THRESHOLD = 8;
        const moveX = e.clientX - startX.current;

        if (Math.abs(moveX) > DRAG_THRESHOLD && initialLoad) {
            setInitialLoad(false);
        }

        const now = Date.now();
        const dx = e.clientX - lastX.current;
        const dt = now - lastMoveTime.current;

        velocityRef.current = dt > 0 ? dx / dt : 0;

        lastX.current = e.clientX;
        lastMoveTime.current = now;

        dragOffset.current = e.clientX - startX.current;

        let clampedOffset = dragOffset.current;
        if (!loop) {
            const pos =
                ((indexRef.current % data.length) + data.length) % data.length;
            const atStartBoundary = pos === 0;
            const atEndBoundary = pos >= data.length - visible;
            if (atStartBoundary && clampedOffset > 0) clampedOffset = 0;
            if (atEndBoundary && clampedOffset < 0) clampedOffset = 0;
        }

        setTranslate(getOffset(indexRef.current) + clampedOffset, false);
    }

    function snap(offset) {
        const pos =
            ((indexRef.current % data.length) + data.length) % data.length;

        const isTouch = pointerTypeRef.current === "touch";

        let steps = 0;

        if (isTouch) {
            const MIN_SWIPE = STEP * 0.2;

            const isForward = velocityRef.current < -0.2 || offset < -MIN_SWIPE;

            const isBackward = velocityRef.current > 0.2 || offset > MIN_SWIPE;

            if (isForward) {
                if (!loop && pos >= data.length - visible) {
                    steps = 0;
                } else {
                    const remaining = data.length - visible - pos;
                    steps =
                        remaining <= 0 ? visible : Math.min(visible, remaining);
                }
            } else if (isBackward) {
                if (!loop && pos === 0) {
                    steps = 0;
                } else {
                    steps = pos === 0 ? -visible : -Math.min(visible, pos);
                }
            } else {
                steps = 0;
            }
        } else {
            steps = -Math.round(offset / STEP);
        }

        slide(steps);
    }

    function onPointerUp(e) {
        if (!isDragging.current) return;
        if (e.pointerType === "mouse" && window.innerWidth > 768) return;

        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        snap(dragOffset.current);
        autoScrollPausedRef.current = false;
    }

    useEffect(() => {
        setTranslate(getOffset(indexRef.current), false);
    }, [STEP]);

    useEffect(() => {
        if (!canScroll) {
            indexRef.current = 0;
            setTranslate(0, false);
        }
    }, [canScroll]);

    const getSteps = useCallback(
        (direction) => {
            const pos =
                ((indexRef.current % data.length) + data.length) % data.length;

            if (direction > 0) {
                const remaining = data.length - visible - pos;
                if (remaining <= 0) return visible;
                return Math.min(visible, remaining);
            } else {
                if (pos === 0) return -visible;
                return -Math.min(visible, pos);
            }
        },
        [data.length, visible],
    );

    useEffect(() => {
        if (!isReady) return;

        const currentPos = currentPosRef.current;
        indexRef.current = loop ? data.length + currentPos : currentPos;

        if (trackRef.current) {
            trackRef.current.style.transition = "none";
        }
        setAtStart(!loop && currentPos === 0);
        setAtEnd(!loop && currentPos >= data.length - visible);
        setTranslate(getOffset(indexRef.current), false);
    }, [visible]);

    useEffect(() => {
        if (!autoScroll || !isReady || !canScroll) return;

        let lastTime = null;
        let rafId;

        function tick(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            if (
                !autoScrollPausedRef.current &&
                !isDragging.current &&
                trackRef.current
            ) {
                autoScrollAccRef.current += autoScrollSpeed * delta;
                const px = Math.floor(autoScrollAccRef.current);

                if (px >= 1) {
                    autoScrollAccRef.current -= px;
                    indexRef.current +=
                        (scrollDirection === "left" ? -px : px) / STEP;

                    if (indexRef.current >= data.length * 2)
                        indexRef.current -= data.length;
                    if (indexRef.current < data.length)
                        indexRef.current += data.length;

                    setTranslate(getOffset(indexRef.current), false);
                }
            }
            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [
        autoScroll,
        autoScrollSpeed,
        scrollDirection,
        isReady,
        canScroll,
        STEP,
        data.length,
        getOffset,
    ]);

    return (
        <Wrapper $background={background}>
            <CarouselArea
                ref={containerRef}
                $peekSize={peekSize}
                onMouseEnter={() => {
                    autoScrollPausedRef.current = true;
                }}
                onMouseLeave={() => {
                    autoScrollPausedRef.current = false;
                }}
            >
                <PeekOverlayLeft
                    $hidden={initialLoad || (!loop && atStart)}
                    $peekSize={peekSize}
                    $background={background}
                />
                <PeekOverlayRight
                    $hidden={!loop && atEnd}
                    $peekSize={peekSize}
                    $background={background}
                />

                {canScroll && (loop || !atStart) && (
                    <EdgeLeft>
                        <NavButton onClick={() => slide(getSteps(-1))}>
                            <Image
                                src="/cineverse/left-arrow.svg"
                                alt="left arrow"
                                width={30}
                                height={45}
                            />
                        </NavButton>
                    </EdgeLeft>
                )}

                <Viewport
                    ref={viewportRef}
                    onPointerDown={canScroll ? onPointerDown : undefined}
                    onPointerMove={canScroll ? onPointerMove : undefined}
                    onPointerUp={canScroll ? onPointerUp : undefined}
                    onPointerLeave={canScroll ? onPointerUp : undefined}
                    onPointerCancel={canScroll ? onPointerUp : undefined}
                    style={{ visibility: isReady ? "visible" : "hidden" }}
                >
                    <Track ref={trackRef} $gap={gap}>
                        {items.map((item, i) => (
                            <div key={i} style={{ flex: `0 0 ${cardWidth}px` }}>
                                {item}
                            </div>
                        ))}
                    </Track>
                </Viewport>

                {canScroll && (loop || !atEnd) && (
                    <EdgeRight>
                        <NavButton onClick={() => slide(getSteps(1))}>
                            <Image
                                src="/cineverse/right-arrow.svg"
                                alt="right arrow"
                                width={30}
                                height={45}
                            />
                        </NavButton>
                    </EdgeRight>
                )}
            </CarouselArea>
        </Wrapper>
    );
}

const PeekOverlayLeft = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: ${({ $peekSize }) => `${$peekSize + 10}px`};
    height: 100%;
    background: linear-gradient(
        to right,
        ${({ $hidden, $background }) =>
            $hidden ? `${$background} 100%` : `rgba(0, 0, 0, 0.65) 40%`},
        transparent
    );
    z-index: 4;
    pointer-events: none;
    transition: background 300ms ease;
`;

const PeekOverlayRight = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    width: ${({ $peekSize }) => `${$peekSize + 10}px`};
    height: 100%;
    background: linear-gradient(
        to left,
        ${({ $hidden }) => ($hidden ? $background : `rgba(0, 0, 0, 0.65) 40%`)},
        transparent
    );
    z-index: 4;
    pointer-events: none;
    transition: background 300ms ease;
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    background: ${({ $background }) => $background};
    width: 100%;
    padding: 2rem 0;
`;

const CarouselArea = styled.div`
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: ${({ $peekSize }) => `0 ${$peekSize}px`};
`;

const Viewport = styled.div`
    width: 100%;
    overflow: visible;
    touch-action: pan-y;
`;

const Track = styled.div`
    display: flex;
    gap: ${({ $gap }) => `${$gap}px`};
    will-change: transform;
`;

const EdgeBase = styled.div`
    position: absolute;
    top: 0;
    height: 100%;
    width: 80px;
    display: flex;
    align-items: center;
    z-index: 5;
    opacity: 0;
    transition: opacity 200ms ease;
    will-change: opacity;

    &:hover {
        opacity: 1;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

const EdgeLeft = styled(EdgeBase)`
    left: 0;
    justify-content: flex-start;
    padding-left: 8px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.5), transparent);
`;

const EdgeRight = styled(EdgeBase)`
    right: 0;
    justify-content: flex-end;
    padding-right: 8px;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.5), transparent);
`;

const NavButton = styled.button`
    all: unset;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    will-change: opacity, transform;
    transform: translateZ(0);
    -webkit-tap-highlight-color: transparent;
`;
