"use client";

import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";

const SCALE = 1.5;

export default function HoverCard({
    children,
    position,
    anchorRect,
    isLeaving,
}) {
    if (!anchorRect) return null;

    const expandedWidth = anchorRect.width * SCALE;
    const overflow = (expandedWidth - anchorRect.width) / 2;
    const centeredLeft = anchorRect.left - overflow;

    let left;
    if (position === "left") {
        left = anchorRect.left;
    } else if (position === "right") {
        left = anchorRect.right - expandedWidth;
    } else {
        left = centeredLeft;
    }

    const top = anchorRect.top + window.scrollY - 30;

    return createPortal(
        <Overlay
            $position={position}
            style={{
                width: expandedWidth,
                left,
                top,
            }}
            $isLeaving={isLeaving}
        >
            {children}
        </Overlay>,
        document.body,
    );
}

const scaleUp = keyframes`
    from {
        transform: translateY(0%) scale(0.7);
        opacity: 0;
    }
    to {
        transform: translateY(0%) scale(1);
        opacity: 1;
    }
`;

const scaleDown = keyframes`
    from {
        transform: translateY(0%) scale(1);
        opacity: 1;
    }
    to {
        transform: translateY(0%) scale(0.7);
        opacity: 0;
    }
`;

const Overlay = styled.div`
    position: absolute;
    z-index: 9999;
    border-radius: 10px;
    overflow: hidden;
    background: #1a1a1a;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    transform-origin: center;
    animation: ${({ $isLeaving }) => ($isLeaving ? scaleDown : scaleUp)} 300ms
        cubic-bezier(0.36, 1.31, 0.64, 1) forwards;
`;
