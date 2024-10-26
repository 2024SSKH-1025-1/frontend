import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function VideoViewer(props) {
    const [cIndex, setIndex] = useState(undefined);
    const [prevVideo, setPrev] = useState(undefined);
    const [nextVideo, setNext] = useState(undefined);

    useEffect(() => {
        setIndex(props.name);
        setPrev(props.name > 0 ? props.list[props.name - 1] : undefined);
        setNext(props.name + 1 < props.list.length ? props.list[props.name + 1] : undefined);
    }, [props.name]);

    function changeSource(mode) {
        if (mode === "next") {
            setPrev(props.list[cIndex]);
            setNext(cIndex + 2 < props.list.length ? props.list[cIndex + 2] : undefined);
            setIndex(cIndex + 1);
        } else {
            setPrev(cIndex - 2 >= 0 ? props.list[cIndex - 2] : undefined);
            setNext(props.list[cIndex]);
            setIndex(cIndex - 1);
        }
    } 

    return (
        <motion.div className="card bg-base-200 h-full">
            <h1 className="text-center text-2xl p-7 bg-base-300 rounded-t-2xl">동영상을 보고 따라해보세요</h1>
            <section className="card-body items-center justify-center">
                <div>
                    {props.list[cIndex] ? 
                        <video 
                            src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/video/${props.list[cIndex]}`}
                            className="h-full w-full rounded-xl" autoPlay controls controlsList="nodownload"
                        />
                    : ""}
                </div>
            </section>
            <section id="control" className="flex rounded-xl m-4 p-2 gap-2 bg-base-300">
                {prevVideo ? <button type="button" className="btn btn-block shrink text-xl" onClick={() => changeSource("prev")}>이전</button> : ""}
                {nextVideo ? <button type="button" className="btn btn-block shrink text-xl" onClick={() => changeSource("next")}>다음</button> : ""}
            </section>
        </motion.div>
    )
}