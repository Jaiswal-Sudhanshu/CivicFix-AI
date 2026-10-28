// ElevenLabs Voice Integration & Audio Redressal Service
// Provides high-fidelity voice output for citizen complaints & interactive status readouts

export const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Empathetic Assistant)", gender: "Female" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Official Municipal Dispatch)", gender: "Male" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Accessible Support)", gender: "Female" }
];

export async function speakCivicResponse(text, apiKey = "", voiceId = "21m00Tcm4TlvDq8ikWAM", onStart = () => {}, onEnd = () => {}) {
  // If user provided an active ElevenLabs API key, call official ElevenLabs API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      onStart();
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey.trim()
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API returned status ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        onEnd();
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        onEnd();
      };
      
      await audio.play();
      return { success: true, provider: "ElevenLabs API" };
    } catch (err) {
      console.warn("ElevenLabs direct API call failed or rate-limited. Falling back to browser voice engine:", err);
    }
  }

  // Robust Native Fallback: Ensures zero-failure demo during pitch
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech
    onStart();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = () => {
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return { success: true, provider: "Native Audio Fallback (Demo-Safe)" };
  }

  onEnd();
  return { success: false, error: "Speech synthesis unsupported on this browser" };
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
