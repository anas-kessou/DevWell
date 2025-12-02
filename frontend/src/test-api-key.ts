// Test script to verify Gemini API key works
import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_API_KEY;

console.log('Testing Gemini API Key...');
console.log('API Key present:', !!apiKey);
console.log('API Key length:', apiKey?.length);

if (!apiKey) {
    console.error('❌ No API key found in environment');
    throw new Error('VITE_API_KEY not set');
}

try {
    const ai = new GoogleGenAI({ apiKey });
    console.log('✅ GoogleGenAI client created successfully');

    // Test if we can access the live API
    console.log('Testing live.connect availability...');
    console.log('ai.live exists:', !!ai.live);
    console.log('ai.live.connect exists:', !!ai.live?.connect);

    if (!ai.live || !ai.live.connect) {
        console.error('❌ Gemini Live API not available');
        console.error('This API key might not have access to Gemini Live');
    } else {
        console.log('✅ Gemini Live API appears to be available');
    }

} catch (error) {
    console.error('❌ Error creating GoogleGenAI client:', error);
    throw error;
}
