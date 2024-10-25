import React, { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

const PoseNetComponent = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const setupCamera = async () => {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                alert("웹캠을 사용할 수 없습니다.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            });
            videoRef.current.srcObject = stream;
            await new Promise((resolve) => {
                videoRef.current.onloadedmetadata = () => {
                    resolve(videoRef.current);
                };
            });
        };

        const loadPosenet = async () => {
            const net = await posenet.load();
            setInterval(() => detectPose(net), 100);
        };

        const detectPose = async (net) => {
            if (videoRef.current && canvasRef.current) {
                const pose = await net.estimateSinglePose(videoRef.current, {
                    flipHorizontal: false,
                });

                const keypointPositions = [];

                pose.keypoints.forEach((keypoint) => {
                    if (keypoint.score >= 0.5) {
                        const { x, y } = keypoint.position;
                        keypointPositions.push({
                            part: keypoint.part,
                            position: { x, y },
                            score: keypoint.score,
                        });
                    }
                });
                if (keypointPositions.length >= 11) {
                    sendDataToBackend(keypointPositions);
                }
                console.log(keypointPositions);

                drawPose(pose);
            }
        };

        const drawPose = (pose) => {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, 640, 480);

            // 각 키포인트를 그리기
            pose.keypoints.forEach((keypoint) => {
                if (keypoint.score >= 0.5) {
                    const { y, x } = keypoint.position;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = "red";
                    ctx.fill();
                }
            });

            // 목과 허리 포인트 계산
            const leftShoulder = pose.keypoints.find(
                (k) => k.part === "leftShoulder"
            );
            const rightShoulder = pose.keypoints.find(
                (k) => k.part === "rightShoulder"
            );
            const leftHip = pose.keypoints.find((k) => k.part === "leftHip");
            const rightHip = pose.keypoints.find((k) => k.part === "rightHip");

            let neck = null;
            let waist = null;

            if (leftShoulder.score >= 0.5 && rightShoulder.score >= 0.5) {
                // 목 좌표 계산
                const neckX =
                    (leftShoulder.position.x + rightShoulder.position.x) / 2;
                const neckY =
                    (leftShoulder.position.y + rightShoulder.position.y) / 2;

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
                const waistX = (leftHip.position.x + rightHip.position.x) / 2;
                const waistY = (leftHip.position.y + rightHip.position.y) / 2;

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
                ctx.lineTo(leftHip.position.x, leftHip.position.y);
                ctx.strokeStyle = "orange";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            if (waist && rightHip.score >= 0.5) {
                // 허리와 오른쪽 엉덩이 연결
                ctx.beginPath();
                ctx.moveTo(waist.position.x, waist.position.y);
                ctx.lineTo(rightHip.position.x, rightHip.position.y);
                ctx.strokeStyle = "orange";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // 기존의 스켈레톤 그리기 (팔과 다리)
            drawSkeleton(pose.keypoints, 0.5, ctx);
        };

        // 각 연결에 대한 색상을 정의
        const connectionColors = {
            "leftElbow-leftShoulder": "cyan",
            "leftElbow-leftWrist": "magenta",
            "rightElbow-rightShoulder": "cyan",
            "rightElbow-rightWrist": "magenta",
            "leftShoulder-rightShoulder": "yellow",
            "leftHip-leftKnee": "blue",
            "leftKnee-leftAnkle": "blue",
            "rightHip-rightKnee": "green",
            "rightKnee-rightAnkle": "green",
        };

        // 팔과 다리를 연결하는 스켈레톤 그리기 함수
        const drawSkeleton = (keypoints, minConfidence, ctx) => {
            const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
                keypoints,
                minConfidence
            );

            // 제외할 연결 쌍을 명시적으로 지정
            const excludedConnections = [
                ["leftHip", "leftShoulder"],
                ["rightHip", "rightShoulder"],
                ["leftHip", "rightHip"],
            ];

            adjacentKeyPoints.forEach((keypointPair) => {
                const fromPart = keypointPair[0].part;
                const toPart = keypointPair[1].part;

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
                        keypointPair[0].position.x,
                        keypointPair[0].position.y
                    );
                    ctx.lineTo(
                        keypointPair[1].position.x,
                        keypointPair[1].position.y
                    );
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        };

        setupCamera();
        loadPosenet();
    }, []);

    return (
        <div style={{ position: "relative", width: 640, height: 480 }}>
            <video
                ref={videoRef}
                style={{ position: "absolute", top: 0, left: 0 }}
                autoPlay
                playsInline
                muted
                width="640"
                height="480"
            />
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0 }}
                width="640"
                height="480"
            />
        </div>
    );
};

const sendDataToBackend = async (data) => {
    try {
        const response = await fetch("http://localhost:8000/pose", {
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
        console.log("back :", result);
    } catch (error) {
        console.error("error :", error);
    }
};

export default PoseNetComponent;
