"use client";
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

export default function SpeechToText(props) {
    const [transcription, setTranscription] = useState('');
    const [recorder, setMediaRecorder] = useState(null);

    // Function to convert audio blob to base64 encoded string
    const audioBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
            const arrayBuffer = reader.result;
            const base64Audio = btoa(
                new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
                )
            );
            resolve(base64Audio);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    };

    if (!process.env.NEXT_PUBLIC_APP_GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY not found in the environment");
    }
    
    const apiKey = process.env.NEXT_PUBLIC_APP_GOOGLE_API_KEY;

    const processAudio = async(event) => {
        console.log('Data available event triggered');
        const audioBlob = event.data;

        const base64Audio = await audioBlobToBase64(audioBlob);
        
        try {
            const startTime = performance.now();

            const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
                "method": "post",
                "body": JSON.stringify({
                    config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'ko-KR',
                    },
                    audio: {
                    content: base64Audio,
                    },
                })
            }).then(async (data) => await data.json());

            console.log(response);

            const endTime = performance.now();
            const elapsedTime = endTime - startTime;

            console.log('Time taken (ms):', elapsedTime);

            if (response.results && response.results.length > 0) {
                let maxLength = 0;
                let maxLengthIndex = 0;

                for (let i = 0; i < response.results.length; i++) {
                    const time = response.results[i].resultEndTime.split("s");
                    if (maxLength < parseFloat(time[0])) {
                        maxLength = parseFloat(time[0]);
                        maxLengthIndex = i;
                    }
                }

                setTranscription(`${transcription} ${response.results[maxLengthIndex].alternatives[0].transcript}`);
            }
        } catch {
            console.log('Error with Google Speech-to-Text API');
        }
    }

    const startRecording = async () => {
        try {
            setMediaRecorder(new MediaRecorder(props.micStream));
        } catch (error) {
            console.error('Error getting user media:', error);
        }
    };

    const stopRecording = async () => {
        if (recorder) {
            recorder.stop();
        }
    }

    const removeTranscription = () => {
        setTranscription("");
    }

    useEffect(() => {
        if (recorder) {
            recorder.addEventListener('dataavailable', processAudio);
            recorder.start();
        }
    }, [recorder])

    useEffect(() => {
        if (props.micStream) {
            startRecording();
        } else {
            console.log("detached");
            stopRecording();
        }
    }, [props.micStream])

    return (
        <motion.div className="card bg-base-200 w-full rounded-xl h-1/2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card-body">
                <p className="alert bg-base-300 grow-0">
                    <span className="material-symbols-outlined">info</span>
                    메시지 입력이 완료되면 정지 버튼을 눌러주세요!
                </p>
                <p>{transcription}</p>
            </div>
            <form className="flex gap-2 bg-base-300 m-8 p-2 rounded-xl" action={props.action}>
                <input type="hidden" name="script" value={transcription} />
                <button className="btn btn-block shrink text-lg">메시지 전송하기</button>
                <button type="button" className="btn btn-block shrink text-lg" onClick={removeTranscription}>지우기</button>
            </form>
        </motion.div>
    );
}