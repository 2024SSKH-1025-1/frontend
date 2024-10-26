import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { VideoPlayingContext } from "../context/VideoPlaying";

export default function VideoViewer(props) {
    const { playing, setPlaying } = useContext(VideoPlayingContext);

    const video = useRef(null);
    const [cIndex, setIndex] = useState(undefined);
    const [prevVideo, setPrev] = useState(undefined);
    const [nextVideo, setNext] = useState(undefined);
    const [replay, setReplayBtn] = useState(false);

    useEffect(() => {
        if (!playing && video.current) {
            video.current.pause();
        } else if (playing && video.current) {
            video.current.play();
        }
    }, [playing])

    useEffect(() => {
        setIndex(props.name);
        setPrev(props.name > 0 ? props.list[props.name - 1] : undefined);
        setNext(props.name + 1 < props.list.length ? props.list[props.name + 1] : undefined);
        setPlaying(true);
    }, [props.name]);

    function changeSource(mode) {
        setPlaying(false);
        if (mode === "next") {
            setPrev(props.list[cIndex]);
            setNext(cIndex + 2 < props.list.length ? props.list[cIndex + 2] : undefined);
            setIndex(cIndex + 1);
        } else {
            setPrev(cIndex - 2 >= 0 ? props.list[cIndex - 2] : undefined);
            setNext(props.list[cIndex]);
            setIndex(cIndex - 1);
        }

        setReplayBtn(false);
        setTimeout(() => setPlaying(true), 1500);
    }

    function showReplay() {
        setReplayBtn(true);
        setPlaying(false);
    }

    function replayVideo() {
        if (video.current) {
            video.current.play();
            setReplayBtn(false);
            setPlaying(true);
        }
    }

    return (
        <motion.div className="card bg-base-200 h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between p-5 bg-base-300 rounded-t-2xl items-center">
                <h1 className="text-2xl">동영상을 보고 따라해보세요</h1>
                <button type="button" className="btn btn-circle"
                    onClick={() => {
                        props.setVideoPage(null);
                        setReplayBtn(false);
                        setPlaying(false);
                    }}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <section className="card-body items-center justify-center">
                {props.list[cIndex] ? (
                    <div className="flex flex-col gap-2 my-2">
                        <h2 className="text-2xl">{props.list[cIndex].title}</h2>
                        <p>{props.list[cIndex].description}</p>
                        <p className="flex gap-2 items-center">
                            <span className="badge badge-outline text-emerald-700 h-8 text-lg break-keep">효과</span>
                            {props.list[cIndex].effect}
                        </p>
                    </div>
                ) : ""}
                <div>
                    {props.list[cIndex] ? 
                        <video 
                            ref={video}
                            src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/video/${props.list[cIndex].video}`}
                            className="h-full w-full rounded-xl" autoPlay controls controlsList="nodownload"
                            onEnded={showReplay}
                            onPause={() => setPlaying(false)}
                            onPlay={() => setPlaying(true)}
                        />
                    : ""}
                    {replay ? <div className="relative w-full h-full top-[-100%] z-10 backdrop-blur flex items-center justify-center rounded-xl">
                        <button type="button" className="absolute" onClick={replayVideo}>
                            <span className="material-symbols-outlined text-4xl btn btn-circle">refresh</span>
                        </button>
                    </div>
                    :""}
                </div>
            </section>
            <section id="control" className="flex rounded-[2rem] m-4 p-2 gap-2 bg-base-300">
                {prevVideo ? <button type="button" className="btn btn-block shrink text-xl" onClick={() => changeSource("prev")}>이전</button> : ""}
                {nextVideo ? <button type="button" className="btn btn-block shrink text-xl" onClick={() => changeSource("next")}>다음</button> : ""}
            </section>
        </motion.div>
    )
}