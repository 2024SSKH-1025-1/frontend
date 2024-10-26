"use client";
import { SendSpeech } from "./actions/SendSpeech";
import Microphone from "./components/Microphone";
import ResultViewer from "./components/ResultViewer";
import SpeechToText from "./components/SpeechToText";
import PoseNetComponent from "./PoseNetComponent";
import { useState, useActionState } from "react";

export default function Home() {
  const [micStream, setMicStream] = useState(null);
  const [videoName, setVideo] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [result, sendScript] = useActionState(SendSpeech, null)

  return (
    <main className="flex m-4 gap-4 bg-base-100">
      <section id="userMedia" className="h-[calc(100vh-2em)] gap-4 flex flex-col w-1/2">
        <PoseNetComponent/>
        <Microphone micStream={micStream} setMicStream={setMicStream} />
      </section>
      <section id="userResult" className="flex flex-col gap-4 w-1/2">
        {!videoName ? (<>
          <SpeechToText micStream={micStream} action={sendScript} />
          <ResultViewer result={result} />      
        </>) : (<></>)}
      </section>
    </main>
  );
}
