"use client";
import { useState, useRef } from "react";
import { Visualizer } from "react-sound-visualizer";

export default function Microphone(props) {
    const [mic, setMic] = useState(false);
    const [loadingMic, setLoading] = useState(false);
    
    const dialog = useRef(null);

    async function setMicrophone() {
        if (!mic) {
            props.setVideo(null);
            setLoading(true);
            try {
                props.setMicStream(await navigator.mediaDevices.getUserMedia({
                    audio: true
                }));
                setMic(true);
            } catch {
                if (dialog.current) {
                    dialog.current.showModal();
                }
            }
            setLoading(false);
        } else {
            props.setMicStream(null);
            setMic(false);
        }
    }

    return (
        <div className="flex gap-2 h-max p-4 bg-base-200 rounded-xl" exit={{ opacity: 0 }}>
            <Visualizer audio={props.micStream} mode={"current"} autoStart={true} lineWidth="thin">
                {({ canvasRef, reset }) => (
                    <>
                        <button type="button" className="btn text-lg bg-base-100" onClick={() => {
                            setMicrophone(); reset; }}>
                            {loadingMic ? 
                                <>
                                <span className="loading loading-spinner" />
                                마이크를 켜는 중
                                </> : 
                                <>
                                <span className="material-symbols-outlined">{!mic ? "speech_to_text" : "stop"}</span>
                                {!mic ? "질문하기" : "그만 말하기"}
                                </>}
                        </button>
                        <canvas ref={canvasRef} className="h-10 w-full rounded-xl" />
                    </>
                )}
            </Visualizer>
            <dialog ref={dialog} className="modal">
                <div className="modal-box">
                    <h1 className="text-2xl my-2">마이크 권한을 부여받지 못했어요</h1>
                    <p className="my-2">설정에서 마이크 권한을 허용해주시거나, 다시 시도해주세요.</p>
                    <form method="dialog">
                        <button type="submit" className="btn btn-block">닫기</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}