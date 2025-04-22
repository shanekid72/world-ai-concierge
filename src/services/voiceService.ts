import axios from 'axios';

// API key for voice services
const API_KEY = 'sk_c054dafc94ee46e316d9b356c907ed692ed453a831ffd50c';

// Voice service options
const VOICE_ID = 'nova'; // Female voice that sounds engaging and friendly
const MODEL_ID = 'eleven_turbo_v2';

/**
 * Converts text to speech using ElevenLabs API
 * @param text The text to convert to speech
 * @returns A promise that resolves to an audio blob
 */
export async function textToSpeech(text: string): Promise<Blob> {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        }
      },
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Plays audio from a blob
 * @param audioBlob The audio blob to play
 * @returns A promise that resolves when the audio finishes playing
 */
export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}

/**
 * Cache for audio files to avoid re-generating speech for the same text
 */
const audioCache = new Map<string, Blob>();

/**
 * Get audio for text, using cache if available
 * @param text The text to convert to speech
 * @returns A promise that resolves to an audio blob
 */
export async function getCachedAudio(text: string): Promise<Blob> {
  // For very long text, truncate for caching purposes
  const cacheKey = text.length > 100 ? `${text.substring(0, 100)}...` : text;
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }
  
  const audioBlob = await textToSpeech(text);
  audioCache.set(cacheKey, audioBlob);
  return audioBlob;
}

/**
 * Speaks the given text and returns a promise that resolves when speaking is done
 * @param text The text to speak
 * @returns A promise that resolves when speaking is done
 */
export async function speakText(text: string): Promise<void> {
  try {
    const audioBlob = await getCachedAudio(text);
    return await playAudio(audioBlob);
  } catch (error) {
    console.error('Error speaking text:', error);
  }
} 