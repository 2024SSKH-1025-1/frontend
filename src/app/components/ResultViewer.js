"use client"
import { motion } from "framer-motion";
import { useEffect } from "react";


export default function ResultViewer(props) {
    console.log(props.result);

    useEffect(() => {
        if (props.result) {
            const videoList = [];
            if (!props.result.error) {
                props.result.map(element => videoList.push(element[1]));
            }

            props.setVideoList(videoList);
        }
    
    }, [props.result]);

    return (
        <div className="card bg-base-200 h-1/2">
            <section className="card-body">
                {props.result ? 
                    (props.result.error ? "오류가 발생했습니다." : (
                        <ul className="list-none p-0">
                            {props.result.map((element, index) => 
                            <motion.li className="flex gap-2 items-center my-2" key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 * index }}>
                                <span>{element[0]}</span>
                                <button className="btn bg-base-100" onClick={() => props.setVideo(element[1])}>보기</button>
                            </motion.li>
                            )}
                        </ul>
                    )) 
                : <p>응답을 기다리는 중입니다.</p>}
            </section>

        </div>
    )
}