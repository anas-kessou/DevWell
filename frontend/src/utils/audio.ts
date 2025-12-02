export const downsampleBuffer = (buffer: Float32Array, sampleRate: number, outSampleRate: number): Float32Array => {
    if (outSampleRate === sampleRate) {
        return buffer;
    }
    if (outSampleRate > sampleRate) {
        // Upsampling not supported for this simple implementation
        return buffer;
    }
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0, count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
};

export const pcmToBlob = (pcmData: Float32Array, _sampleRate = 16000): Blob => {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
        const s = Math.max(-1, Math.min(1, pcmData[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([buffer], { type: 'audio/pcm' });
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const decodeAudioData = async (
    audioData: Uint8Array,
    audioContext: AudioContext,
    sampleRate = 24000
): Promise<AudioBuffer> => {
    // Create a WAV header for the PCM data to make it decodable by decodeAudioData
    // Or simpler: just create an AudioBuffer and fill it if we know the format (PCM 16bit or Float32)
    // The input from Gemini is typically PCM 16bit 24kHz mono (or similar).
    // Let's assume raw PCM 16bit little endian for now and convert manually if decodeAudioData fails on raw.
    // Actually, Web Audio API decodeAudioData expects a full file container (WAV/MP3).
    // So we need to wrap PCM in WAV or manually convert to AudioBuffer.

    // Manual conversion from Int16 PCM to Float32 AudioBuffer
    const pcm16 = new Int16Array(audioData.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
    }

    const buffer = audioContext.createBuffer(1, float32.length, sampleRate);
    buffer.copyToChannel(float32, 0);
    return buffer;
};
