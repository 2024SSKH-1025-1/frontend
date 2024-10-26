"use client";
import React from "react";
import dynamic from "next/dynamic";

const PoseNetComponent = dynamic(() => import("./PoseNetComponent"), {
    ssr: false,
});

export default function Home() {
    return (
        <div>
            <h1>PoseNet 실시간 포즈 추적</h1>
            <PoseNetComponent />
        </div>
    );
}
