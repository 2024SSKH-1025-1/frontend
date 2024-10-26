"use client"
import { motion } from "framer-motion";
import { useEffect } from "react";


export default function ResultViewer(props) {

    useEffect(() => {
        if (props.result) {
            if (!props.result.error) {
                props.setVideoList(props.result);
            }
        }
    }, [props.result]);

    return (
        <motion.div className="card bg-base-200 h-[calc(50vh-2rem)]" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="card-body overflow-scroll grow-0">
                {props.result ? 
                    (props.result.error ? <p>{props.result.error}</p> : (
                        <ul className="list-none p-0">
                            {props.result.map((element, index) => 
                            <motion.li className="flex gap-2 items-center justify-between my-2 border-b-2" key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 * index }}>
                                <div className="flex flex-col gap-1 my-2">
                                    <h2 className="text-2xl">{element.title}</h2>
                                    <p>{element.description}</p>
                                    <p className="flex gap-2">
                                        <span className="badge badge-primary text-md w-12 shrink-0">효과</span>
                                        {element.effect}
                                    </p>
                                </div>
                                <button className="btn btn-circle bg-base-100" onClick={() => props.setVideo(index)}>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </motion.li>
                            )}
                        </ul>
                    )) 
                : <p>응답을 기다리는 중입니다.</p>}
            </section>
        </motion.div>
    )
}