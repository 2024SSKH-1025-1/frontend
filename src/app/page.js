"use client";
import { SendSpeech } from "./actions/SendSpeech";
import Microphone from "./components/Microphone";
import ResultViewer from "./components/ResultViewer";
import SpeechToText from "./components/SpeechToText";
import PoseNetComponent from "./components/PoseNetComponent";
import AccuracyBar from "./components/AccuracyBar";
import { useState, useActionState } from "react";
import { AnimatePresence } from "framer-motion";
import VideoViewer from "./components/VideoViewer";

export default function Home() {
  const [micStream, setMicStream] = useState(null);
  const [videoIndex, setVideo] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [result, sendScript] = useActionState(SendSpeech, null);

  return (
    <main className="flex m-4 gap-4 bg-base-100">
      <section id="userMedia" className="h-[calc(100vh-2em)] gap-4 flex flex-col w-1/2">
        <PoseNetComponent />
        <AccuracyBar />
        <Microphone micStream={micStream} setMicStream={setMicStream} setVideo={setVideo} />
      </section>
      <section id="userResult" className="flex flex-col gap-4 w-1/2">
        <AnimatePresence>
          {!videoList[videoIndex] ? (
            <>
              <SpeechToText micStream={micStream} action={sendScript} />
              <ResultViewer result={result} setVideo={setVideo} setVideoList={setVideoList} />
            </>
          ) : (
            <VideoViewer name={videoIndex} list={videoList} setVideoPage={setVideo} />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
