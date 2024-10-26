"use client";
import Microphone from "./components/Microphone";
import SpeechToText from "./components/SpeechToText";
import PoseNetComponent from "./PoseNetComponent";
import { useState } from "react";

export default function Home() {
  const [micStream, setMicStream] = useState(null);

  return (
    <main className="flex m-4 gap-4 bg-base-100">
      <section id="userMedia" className="h-[calc(100vh-2em)] gap-4 flex flex-col w-1/2">
        <PoseNetComponent/>
        <Microphone micStream={micStream} setMicStream={setMicStream} />
      </section>
      <section id="userResult" className="flex flex-col gap-4 w-1/2">
        <SpeechToText micStream={micStream} />
      </section>
    </main>
  );
}
