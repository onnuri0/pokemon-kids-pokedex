import { useState, useEffect, useRef } from 'react';

export function useVoiceRecognition(onResult) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Chrome, Edge, Safari 등 브라우저 호환성 지원
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('이 브라우저는 음성 인식을 지원하지 않아요.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어 인식
    recognition.interimResults = false; // 확정된 결과만 수신
    recognition.continuous = false; // 한 문장 인식 후 자동 종료
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && onResult) {
        // 불필요한 마침표나 공백 정리 (예: "피카츄." -> "피카츄")
        const cleanText = transcript.trim().replace(/[.?!]/g, '');
        onResult(cleanText);
      }
    };

    recognition.onerror = (event) => {
      console.warn('음성 인식 오류:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('마이크 사용 권한을 허용해 주세요!');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('음성 인식 시작 실패:', err);
      }
    }
  };

  return { isListening, toggleListening, errorMsg };
}