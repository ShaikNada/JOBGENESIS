import { useState, useEffect, useCallback, useRef } from 'react';

// Extend window interface for browser-native speech recognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript((prev) => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

        } else {
            console.warn("Speech Recognition API is not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { isRecording, transcript, startRecording, stopRecording, clearTranscript };
}
