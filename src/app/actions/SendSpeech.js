"use server";

export async function SendSpeech(state, formData) {
    const result = await fetch(`${process.env.API_ENDPOINT}/process-text/`, {
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