'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  language?: string;
}

export default function VoiceInput({ onTranscript, disabled = false, language = 'zh-CN' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器支持
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = transcript + finalTranscript;
        setTranscript(fullTranscript);
        onTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          alert('请允许麦克风权限以使用语音输入功能');
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // 如果应该还在监听，重新启动
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('启动语音识别失败:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscript('');
  };

  return (
    <div className="flex items-center gap-2">
      {!isSupported && (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>浏览器不支持语音</span>
        </div>
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !isSupported}
        className={`
          relative inline-flex items-center justify-center
          w-10 h-10 rounded-lg
          transition-all duration-200
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }
          ${disabled || !isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? '停止录音' : '开始录音'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}

        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {transcript && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearTranscript}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            清空
          </button>
        </div>
      )}
    </div>
  );
}
