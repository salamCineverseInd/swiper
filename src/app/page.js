"use client";

import Image from "next/image";
import Carousel from "./Carousel";

export default function page() {
    const data = Array.from({ length: 17 }, (_, i) => i + 1);

    return (
        <Carousel loop={true}>
            {data.map((item) => (
                <CardComponent item={item} key={item} />
            ))}
        </Carousel>
    );
}

export function CardComponent({ item }) {
    const avatarSrc = `https://i.pravatar.cc/300?img=${item}`;
    const BLUR_PLACEHOLDER =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background:
                    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                borderRadius: "12px",
                boxSizing: "border-box",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Decorative circle */}
            <div
                style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                }}
            />

            {/* Top: avatar */}
            <div
                style={{ display: "flex", justifyContent: "center", zIndex: 1 }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    <Image
                        src={avatarSrc}
                        alt={`avatar-${item}`}
                        fill
                        sizes="72px"
                        style={{ objectFit: "cover" }}
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                    />
                </div>
            </div>

            {/* Name + handle */}
            <div style={{ textAlign: "center", zIndex: 1 }}>
                <div
                    style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}
                >
                    User {item}
                </div>
                <div
                    style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "12px",
                        marginTop: "2px",
                    }}
                >
                    @user{item}
                </div>
            </div>

            {/* Quote */}
            <div style={{ zIndex: 1 }}>
                <p
                    style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                        textAlign: "center",
                    }}
                >
                    "Exploring the world one step at a time. Life is short, make
                    it beautiful."
                </p>
            </div>

            {/* Tag */}
            <div
                style={{ display: "flex", justifyContent: "center", zIndex: 1 }}
            >
                <span
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "10px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.15)",
                    }}
                >
                    #{item % 2 === 0 ? "travel" : "lifestyle"}
                </span>
            </div>
        </div>
    );
}
