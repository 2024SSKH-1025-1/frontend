"use server";

export async function SendSpeech(state, formData) {
    if (formData.get("script") === "") {
        return {
            error: "요청하신 내용이 없어요"
        }
    }

    const result = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/process-text/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "text": formData.get("script")
        })
    });

    if (result.ok) {
        return await result.json();   
    } else {
        return {
            error: await result.json() 
        };
    }
}