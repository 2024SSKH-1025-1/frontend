"use client";
import React, { useState, useContext, useRef, useEffect } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from "@tensorflow/tfjs";
import AccuracyBar from "./AccuracyBar";

import { VideoPlayingContext } from "../context/VideoPlaying";

const PoseNetComponent = () => {
    const { playing, setPlaying } = useContext(VideoPlayingContext);

    const lastSaveTimeRef = useRef(null);
    const [backendKeypoints, setBackendKeypoints] = useState(null);
    const [loadingMic, setLoading] = useState(false);
    const [camera, setCamera] = useState(undefined);
    const [replay, setReplayBtn] = useState(false);
    const [errorType, setErrorType] = useState("camera");
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const dialog = useRef(null);

    const setupCamera = async () => {
        setLoading(true);

        if (camera) {
            camera.getTracks().forEach(track => track.stop());
            setCamera(undefined);
            setLoading(false);
            setReplayBtn(true);
            setPlaying(false);
        } else {
            try {
                const currentCamera = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                })
                setCamera(currentCamera);
                videoRef.current.srcObject = currentCamera;
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        resolve(videoRef.current);
                    };
                });
    
                // fetchBackendKeypoints();
                loadPosenet();
                setLoading(false);
                setReplayBtn(false);
            } catch {
                if (dialog.current) {
                    setErrorType("camera");
                    dialog.current.showModal();
                }
                setCamera(undefined);
                setLoading(false);
                setReplayBtn(true);
                setPlaying(false);
            }
        }
    };

    const loadPosenet = async () => {
        await tf.setBackend("webgl");
        await tf.ready();

        try {
            const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);            
            setInterval(() => detectPose(detector), 100);
        } catch {
            if (dialog.current) {
                setErrorType("canvas");
                dialog.current.showModal();
            }
            setCamera(undefined);
            setLoading(false);
            setReplayBtn(true);
        }
    };

    const fetchBackendKeypoints = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/next-keypoint`);
            if (!response.ok) {
                throw new Error("서버 응답이 올바르지 않습니다.");
            }
            const data = await response.json();
            setBackendKeypoints(data.keypoints);
        } catch (error) {
            console.error("백엔드에서 키포인트를 가져오는 중 오류:", error);
        }
    };

    const calculateCosineSimilarity = (keypoints1, keypoints2) => {
        if (keypoints1.length !== keypoints2.length) {
            console.warn("키포인트 수가 다릅니다. 공통 키포인트만 전달해야 합니다.");
            return 0;
        }

        // 두 벡터의 x, y 좌표 차원별로 벡터 구성
        const vector1 = [];
        const vector2 = [];

        keypoints1.forEach((kp1, index) => {
            const kp2 = keypoints2[index];

            vector1.push(kp1.x, kp1.y);
            vector2.push(kp2.x, kp2.y);
        });

        // 벡터 내적 계산
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);

        // 벡터 크기 계산
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val ** 2, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val ** 2, 0));

        // 코사인 유사도 계산
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        } else {
            return dotProduct / (magnitude1 * magnitude2);
        }
    };

    const addGaussianNoiseToFrame = (imageTensor, noiseStdDev) => {
        const noise = tf.randomNormal(imageTensor.shape, 0, noiseStdDev);
        return imageTensor.add(noise).clipByValue(0, 255);
    };

    const detectPose = async (detector) => {
        if (videoRef.current && canvasRef.current) {
            const poses = await detector.estimatePoses(videoRef.current);   

            // const videoTensor = tf.browser.fromPixels(videoRef.current);

            // // 비디오 프레임에 가우시안 노이즈 추가
            // const noiseStdDev = 3; // 필요에 따라 조절
            // const noisyFrame = addGaussianNoiseToFrame(videoTensor, noiseStdDev);

            // // 노이즈가 추가된 프레임으로 포즈 추정
            // const pose = await net.estimateSinglePose(noisyFrame, {
            //     flipHorizontal: false,
            // });

            // // 메모리 해제를 위해 텐서 삭제
            // videoTensor.dispose();
            // noisyFrame.dispose();

            // const keypointPositions = [];

            // keypoints.forEach((keypoint) => {
            //     if (keypoint.score >= 0.5) {
            //         const { x, y } = keypoint.position;

            //         const noiseX = tf.randomNormal([1], 0, noiseStdDev).dataSync()[0];
            //         const noiseY = tf.randomNormal([1], 0, noiseStdDev).dataSync()[0];

            //         keypointPositions.push({
            //             part: keypoint.part,
            //             position: { x: x + noiseX, y: y + noiseY },
            //             score: keypoint.score,
            //         });
            //     }
            // });

            if (poses.length > 0) {
                const pose = poses[0];
          
                if (backendKeypoints) {
                    const commonKeypoints = keypointPositions.filter((clientPoint) => 
                        backendKeypoints.some((backendPoint) => backendPoint.part === clientPoint.part)
                    );
                    const backendCommonKeypoints = backendKeypoints.filter((backendPoint) => 
                        keypointPositions.some((clientPoint) => clientPoint.part === backendPoint.part)
                    );
                  
                    if (commonKeypoints.length > 0 && commonKeypoints.length === backendCommonKeypoints.length) {
                        const similarity = calculateCosineSimilarity(commonKeypoints, backendCommonKeypoints);
                        console.log("코사인 유사도:", similarity);
                    } else {
                        console.log("공통 키포인트가 충분하지 않습니다.");
                    }
                }

                const flippedKeypoints = pose.keypoints.map((keypoint) => ({
                    ...keypoint,
                    x: videoRef.current.videoWidth - keypoint.x, // 가로 축을 따라 뒤집기
                }));
          
                drawPose(flippedKeypoints);
            }

            // if (keypointPositions.length >= 11) {
            //     const intervalInSeconds = 1; // 원하는 시간 간격(초)을 설정하세요
            //     const currentTime = Date.now();

            //     if (!lastSaveTimeRef.current || currentTime - lastSaveTimeRef.current >= intervalInSeconds * 1000) {
            //         // console.log(keypointPositions);
            //         // 데이터를 백엔드로 전송하거나 배열에 저장
            //         // sendDataToBackend(keypointPositions);

            //         lastSaveTimeRef.current = currentTime;
            //     }
            // }
        }
    };

    const drawPose = (keypoints) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, 640, 480);

        // 각 키포인트를 그리기
        keypoints.forEach((keypoint) => {
            if (keypoint.score >= 0.5) {
                const { y, x } = keypoint;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }
        });

        // 목과 허리 포인트 계산
        const leftShoulder = keypoints.find(
            (k) => k.name === "left_shoulder"
        );
        const rightShoulder = keypoints.find(
            (k) => k.name === "right_shoulder"
        );
        const leftHip = keypoints.find((k) => k.name === "left_hip");
        const rightHip = keypoints.find((k) => k.name === "right_hip");

        let neck = null;
        let waist = null;

        if (leftShoulder.score >= 0.5 && rightShoulder.score >= 0.5) {
            // 목 좌표 계산
            const neckX =
                (leftShoulder.x + rightShoulder.x) / 2;
            const neckY =
                (leftShoulder.y + rightShoulder.y) / 2;

            neck = {
                position: { x: neckX, y: neckY },
                score: (leftShoulder.score + rightShoulder.score) / 2,
                part: "neck",
            };

            // 목 포인트 그리기
            ctx.beginPath();
            ctx.arc(neckX, neckY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();
        }

        if (leftHip.score >= 0.5 && rightHip.score >= 0.5) {
            // 허리 좌표 계산
            const waistX = (leftHip.x + rightHip.x) / 2;
            const waistY = (leftHip.y + rightHip.y) / 2;

            waist = {
                position: { x: waistX, y: waistY },
                score: (leftHip.score + rightHip.score) / 2,
                part: "waist",
            };

            // 허리 포인트 그리기
            ctx.beginPath();
            ctx.arc(waistX, waistY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "green";
            ctx.fill();
        }

        // 몸통 가운데 연결 그리기
        if (neck && waist) {
            // 목과 허리를 연결
            ctx.beginPath();
            ctx.moveTo(neck.position.x, neck.position.y);
            ctx.lineTo(waist.position.x, waist.position.y);
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (waist && leftHip.score >= 0.5) {
            // 허리와 왼쪽 엉덩이 연결
            ctx.beginPath();
            ctx.moveTo(waist.position.x, waist.position.y);
            ctx.lineTo(leftHip.x, leftHip.y);
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (waist && rightHip.score >= 0.5) {
            // 허리와 오른쪽 엉덩이 연결
            ctx.beginPath();
            ctx.moveTo(waist.position.x, waist.position.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 기존의 스켈레톤 그리기 (팔과 다리)
        drawSkeleton(keypoints, 0.5, ctx);
    };

    // 각 연결에 대한 색상을 정의
    const connectionColors = {
        "left_elbow-left_shoulder": "cyan",
        "left_elbow-left_wrist": "magenta",
        "right_elbow-right_shoulder": "cyan",
        "right_elbow-right_wrist": "magenta",
        "left_shoulder-right_shoulder": "yellow",
        "left_hip-left_knee": "blue",
        "left_knee-left_ankle": "blue",
        "right_hip-right_knee": "green",
        "right_knee-right_ankle": "green",
    };

    // 팔과 다리를 연결하는 스켈레톤 그리기 함수
    const drawSkeleton = (keypoints, minConfidence, ctx) => {
        const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);

        // 제외할 연결 쌍을 명시적으로 지정
        const excludedConnections = [
            ["left_hip", "left_shoulder"],
            ["right_hip", "right_shoulder"],
            ["left_hip", "right_hip"],
            ["left_eye", "right_eye"],
            ["left_eye", "nose"],
            ["right_eye", "nose"],
            ["right_eye", "right_ear"],
            ["left_eye", "left_ear"]
        ];

        adjacentPairs.forEach((keypointPair) => {
            const kps = [keypoints[keypointPair[0]], keypoints[keypointPair[1]]];

            if (kps[0].score >= minConfidence && kps[1].score >= minConfidence) {
                const fromPart = kps[0].name;
                const toPart = kps[1].name;

                // 제외할 연결인지 확인
                const isExcluded = excludedConnections.some(
                    (pair) =>
                        (pair[0] === fromPart && pair[1] === toPart) ||
                        (pair[0] === toPart && pair[1] === fromPart)
                );

                if (!isExcluded) {
                    // 연결의 키로 사용할 문자열 생성
                    const connectionKey = `${fromPart}-${toPart}`;
                    const reverseConnectionKey = `${toPart}-${fromPart}`;

                    // 연결의 색상 설정
                    let strokeColor = "green"; // 기본 색상
                    if (connectionColors[connectionKey]) {
                        strokeColor = connectionColors[connectionKey];
                    } else if (connectionColors[reverseConnectionKey]) {
                        strokeColor = connectionColors[reverseConnectionKey];
                    }

                    // 선 그리기
                    ctx.beginPath();
                    ctx.moveTo(
                        kps[0].x,
                        kps[0].y
                    );
                    ctx.lineTo(
                        kps[1].x,
                        kps[1].y
                    );
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        });
    };

    useEffect(() => {
        setupCamera();
    }, []);

    return (
        <div className="mockup-browser bg-base-300 border h-full">
            <div className="mockup-browser-toolbar gap-4 justify-between">
                <img src="/logo.png" alt="로고" className="h-16" />
                <button type="button" className="btn text-lg" onClick={setupCamera}>
                    {loadingMic ?
                        <>
                            <span className="loading loading-spinner" />
                            시작하는 중
                        </> : 
                        <>
                            <span className="material-symbols-outlined">{camera ? "videocam_off" : "videocam"}</span>
                            {camera ? "카메라 끄기" : "카메라 켜기"}
                        </>
                    }
                </button>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center pb-20 bg-base-200 h-full">
                <div className="relative w-[640px] h-[480px]">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        width="640"
                        height="480"
                        className="scale-x-[-1] scale-y-[1] rounded-xl"
                    />
                    <canvas
                        ref={canvasRef}
                        width="640"
                        height="480"
                        className="absolute top-0 left-0 rounded-xl"
                    />
                    {replay ? <div className="relative w-full h-full top-[-100%] z-10 backdrop-blur flex items-center justify-center rounded-xl">
                        <button type="button" className="absolute btn btn-circle text-lg" onClick={setupCamera}>
                            <span className="material-symbols-outlined text-4xl">refresh</span>
                        </button>
                    </div>
                    :""}
                </div>
                {playing ? <AccuracyBar /> : ""}
                <dialog ref={dialog} className="modal">
                    <div className="modal-box">
                        <h1 className="text-2xl my-2">
                            {errorType === "camera" ?
                                "카메라 권한을 부여받지 못했어요" : "자세 인식 서비스 시작에 실패했어요."}
                        </h1>
                        <p className="my-2">
                            {errorType === "camera" ?
                                "설정에서 카메라 권한을 허용해주시거나, 다시 시도해주세요." :
                                "이 창을 닫고 다시 해보세요."}
                        </p>
                        <form method="dialog">
                            <button type="submit" className="btn btn-block">닫기</button>
                        </form>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

const sendDataToBackend = async (data) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/pose`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ keypoints: data }),
        });

        if (!response.ok) {
            throw new Error("서버 응답이 올바르지 않습니다.");
        }

        const result = await response.json();
        console.log("백엔드 응답:", result);
    } catch (error) {
        console.error("백엔드로 데이터 전송 중 오류 발생:", error);
    }
};

export default PoseNetComponent;
