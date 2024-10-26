"use client"
import { motion } from "framer-motion";


export default function ResultViewer(props) {
    console.log(props.result);

    return (
        <div className="card bg-base-200 h-1/2">
            <section className="card-body">
                <p>
                    {props.result ? 
                        (props.result.error ? "오류가 발생했습니다." : (
                            <ul className="list-none p-0">
                                {props.result.map((element, index) => 
                                <motion.li className="block" key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 * index }}>
                                    {element}
                                    <button className="btn" onClick={props.setVideo(element)}>보기</button>
                                </motion.li>
                                )}
                            </ul>
                        )) 
                        : "응답을 기다리는 중입니다."}
                </p>
            </section>

        </div>
    )
}