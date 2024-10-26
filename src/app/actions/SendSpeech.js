"use server";

export async function SendSpeech(state, formData) {
    if (formData.get("script") === "") {
        return {
            error: "요청하신 내용이 없어요"
        }
    }

    const result = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/process-text?text=${formData.get("script")}`, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (result.ok) {
        return await result.json();   
    } else {
        return {
            error: await result.json() 
        };
    }
}