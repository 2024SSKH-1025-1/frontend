"use client";
import { useState, useRef } from "react";
import { Visualizer } from "react-sound-visualizer";

export default function Microphone() {
    const [mic, setMic] = useState(false);
    const [loadingMic, setLoading] = useState(false);
    const [stream, setMicStream] = useState(null);
    
    const dialog = useRef(null);
    const canvas = useRef(null);

    async function setMicrophone() {
        if (!mic) {
            setLoading(true);
            try {
                setMicStream(await navigator.mediaDevices.getUserMedia({
                    audio: true
                }));
                setMic(true);
            } catch {
                dialog.current.showModal();
            }
            setLoading(false);
        } else {
            setMicStream(null);
            setMic(false);
        }
    }

    return (
        <div className="flex gap-2 h-8">
            <Visualizer audio={stream} mode={"current"} autoStart={true} lineWidth="thin">
                {({ canvasRef, reset }) => (
                    <>
                        <button type="button" className="btn btn-circle" onClick={() => {
                            setMicrophone(); reset; }}>
                            {loadingMic ? 
                                <span className="loading loading-spinner" /> : 
                                <span className="material-symbols-outlined">speech_to_text</span>}
                        </button>
                        <canvas ref={canvasRef} className="h-10 w-full rounded-xl" />
                    </>
                )}
            </Visualizer>
            <dialog ref={dialog} className="modal">
                <h1>마이크 권한을 부여받지 못했어요</h1>
                <p>설정에서 마이크 권한을 허용해주시거나, 다시 시도해주세요.</p>
                <form action="dialog">
                    <button className="btn btn-block">닫기</button>
                </form>
            </dialog>
        </div>
    )
}