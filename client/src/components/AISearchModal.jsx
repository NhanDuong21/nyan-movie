import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Sparkles, X, Send, Loader2, Film, MessageSquare, Bot, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const SUGGESTIONS = [
    "Phim hài hước giải trí cuối tuần",
    "Đang thất tình, cần phim chữa lành",
    "Phim hành động kịch tính, nghẹt thở"
];

const AISearchModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (results && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [results, loading]);

    const handleSearch = async (searchQuery) => {
        const queryToUse = searchQuery || prompt;
        if (!queryToUse.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);
        if (!searchQuery) setPrompt(''); 

        try {
            const response = await axiosClient.post('/movies/ai-search', { prompt: queryToUse });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi kết nối với AI.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VN';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                
                if (typeof setPrompt === 'function') {
                    setPrompt(transcript);
                }
                
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                if (event.error === 'aborted' || event.error === 'no-speech') {
                    // Silently handle Apple's frequent aborts/no-speech without alerting
                    return; 
                }
                if (event.error === 'not-allowed') {
                    alert('Vui lòng cấp quyền sử dụng Micro trong cài đặt trình duyệt.');
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = async () => {
        if (!recognitionRef.current) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Safari bản mới nhất.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        try {
            // --- THE IOS ICEBREAKER HACK ---
            // Explicitly request microphone access at the hardware level first
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop the tracks since we just needed to unlock the permission state
                stream.getTracks().forEach(track => track.stop());
            }

            // Now that iOS hardware is "warmed up" and permitted, start the speech recognition
            recognitionRef.current.start();
            
        } catch (err) {
            console.error('Microphone unlock or speech recognition failed:', err);
            setIsListening(false);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                alert('Lỗi: Bạn đã từ chối quyền truy cập Micro. Vui lòng vào Cài đặt của Safari/Chrome để mở lại.');
            } else {
                // Fallback for when recognition fails to start (e.g. already started)
                try {
                    recognitionRef.current.stop();
                } catch (stopErr) {
                    console.error(stopErr);
                }
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">

            <div className={`pointer-events-auto mb-4 w-[calc(100vw-3rem)] sm:w-[400px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[500px] max-h-[70vh]' : 'scale-0 opacity-0 h-0'}`}>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-gray-900 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-full text-white shadow-lg shadow-primary/30">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Trợ lý AI Nyan</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-700 bg-gray-950/50">
                    
                    <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-primary" />
                        </div>
                        <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-3 max-w-[85%] shadow-sm">
                            <p className="text-sm text-gray-200">Xin chào! Bạn đang có tâm trạng thế nào? Để Nyan tìm phim cho bạn nhé!</p>
                        </div>
                    </div>

                    {!results && !loading && (
                        <div className="flex flex-col gap-2 pl-11 mb-6">
                            {SUGGESTIONS.map((sug, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSearch(sug)}
                                    className="text-left text-sm text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-xl transition w-fit"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading && (
                        <div className="flex gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-primary" />
                            </div>
                            <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-primary" />
                                <span className="text-sm text-gray-400">Đang lục tìm kho dữ liệu...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-900/20 text-red-400 text-sm py-2 px-4 rounded-lg border border-red-900/50">
                                {error}
                            </div>
                        </div>
                    )}

                    {results && !loading && (
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-primary" />
                                </div>
                                <div className="bg-gray-800 rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
                                    <p className="text-sm text-gray-200 mb-2 leading-relaxed">
                                        {results.aiAnalysis?.reply || 'Nyan đã tìm thấy một vài bộ phim tuyệt vời dành cho bạn nè!'}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {results.aiAnalysis?.genres?.map((g, i) => (
                                            <span key={`g-${i}`} className="text-[10px] px-2 py-0.5 bg-gray-700 rounded-md text-gray-300">{g}</span>
                                        ))}
                                        {results.aiAnalysis?.countries?.map((c, i) => (
                                            <span key={`c-${i}`} className="text-[10px] px-2 py-0.5 bg-gray-700 rounded-md text-gray-300">{c}</span>
                                        ))}
                                        {results.aiAnalysis?.tags?.slice(0, 3).map((t, i) => (
                                            <span key={`t-${i}`} className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-md">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pl-11 grid grid-cols-2 gap-2">
                                {results.movies?.length > 0 ? (
                                    results.movies.map((movie) => {
                                        const posterSrc = movie.poster?.startsWith('http') ? movie.poster : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${movie.poster}`;
                                        const optimizedPoster = optimizeCloudinaryUrl(posterSrc, 400);
                                        return (
                                            <Link key={movie.id || movie._id} to={`/movie/${movie.slug || movie.id || movie._id}`} onClick={() => setIsOpen(false)} className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[2/3]">
                                                <img src={optimizedPoster} alt={movie.title} className="w-full h-full object-cover transition group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 flex items-end p-2">
                                                    <h4 className="text-white text-xs font-medium line-clamp-2">{movie.title}</h4>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 bg-gray-800/50 rounded-lg p-4 text-center border border-gray-800">
                                        <Film size={24} className="mx-auto mb-2 text-gray-500" />
                                        <p className="text-xs text-gray-400">Không tìm thấy phim phù hợp.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Nhập tâm trạng của bạn..."
                            className="w-full bg-gray-800 border border-gray-700 text-white text-base px-4 py-3 rounded-full focus:outline-none focus:border-primary focus:bg-gray-900 transition pr-20"
                        />
                        
                        <div className="absolute right-1 flex items-center gap-1">
                            {/* Mic Button */}
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                title="Tìm kiếm bằng giọng nói"
                            >
                                <Mic size={16} />
                            </button>

                            {/* Send Button */}
                            <button 
                                type="submit" 
                                disabled={loading || !prompt.trim()}
                                className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-gray-700 transition"
                            >
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </div>
                    </form>
                </div>

            </div>

            <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-gray-800 text-gray-400 rotate-90 scale-90' : 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-primary/40'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

export default AISearchModal;
