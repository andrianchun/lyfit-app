export async function extractBiometricsFromImage(base64Image, mimeType, userApiKey = null) {
    try {
        if (userApiKey && userApiKey.trim() !== '') {
            // Client-side fallback: direct to Google Gemini API
            const prompt = `Extract biometric and activity data from this image. 
Return ONLY a valid JSON object matching the exact keys below. Use numeric values, except for 'sleep' which should be a string (e.g. "7h 30m"). If a value is not found, omit the key or set it to null.
Do NOT wrap the response in markdown code blocks. Just return the raw JSON object.
Expected keys:
{
  "steps": number,
  "activeMinutes": number,
  "activityCalories": number,
  "sleep": string,
  "energyScore": number,
  "weight": number,
  "bodyFat": number,
  "muscleMass": number,
  "heartRate": number,
  "bloodPressure": string
}`;
            const payload = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType || 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }]
            };

            const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
            let res = null;
            let rawText = '';
            let errorMsg = 'Unknown server error';

            for (const model of modelsToTry) {
                try {
                    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userApiKey.trim()}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        break; // Berhasil! Keluar dari loop
                    }

                    if (res.status === 429) {
                        throw new Error('RATE_LIMIT_EXCEEDED');
                    }

                    rawText = await res.text();
                    errorMsg = `Server Error (${res.status}) on ${model}: ${rawText.substring(0, 50)}...`;
                    
                    try {
                        const errData = JSON.parse(rawText);
                        if (errData && errData.error) errorMsg = errData.error.message || errData.error;
                    } catch (e) {}

                    // Jika error 503 (Unavailable) atau 404 (Not Found), biarkan loop mencoba model berikutnya
                    if (res.status !== 503 && res.status !== 404) {
                        throw new Error(errorMsg); // Error fatal lain, langsung berhenti
                    }
                } catch (err) {
                    if (err.message === 'RATE_LIMIT_EXCEEDED' || (errorMsg && err.message !== errorMsg && err.message !== 'RATE_LIMIT_EXCEEDED')) {
                        throw err; // Lempar error network atau rate limit
                    }
                }
            }

            if (!res || !res.ok) {
                throw new Error(errorMsg);
            }

            const data = await res.json();
            let extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            extractedText = extractedText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            return JSON.parse(extractedText);

        } else {
            // Server-side default: use Netlify Function proxy
            const res = await fetch('/.netlify/functions/scanBiometrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64Image,
                    mimeType: mimeType || 'image/jpeg'
                })
            });

            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }
                
                // Baca sebagai text sekali saja (mencegah 'body stream already read' error)
                const rawText = await res.text();
                let errorMsg = `Server Error (${res.status}): ${rawText.substring(0, 50)}...`;
                
                try {
                    // Coba parse jadi JSON, kalau valid dan ada error message, pakai itu
                    const errData = JSON.parse(rawText);
                    if (errData && errData.error) errorMsg = errData.error;
                } catch (parseErr) {
                    // Biarkan errorMsg sebagai plain text jika bukan JSON
                }
                throw new Error(errorMsg);
            }

            return await res.json();
        }
    } catch (error) {
        console.error("AI Vision Error:", error);
        throw error;
    }
}
