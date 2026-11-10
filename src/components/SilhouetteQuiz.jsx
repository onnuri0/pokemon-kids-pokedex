import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAnimePokemonCry } from '../utils/pokemonVoice';

export default function SilhouetteQuiz({ pokemonList, onClose }) {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);

  // 문제 생성 (정답 1개 + 오답 3개)
  const generateNewQuiz = () => {
    if (!pokemonList || pokemonList.length < 4) return;

    setIsRevealed(false);
    setSelectedAnswer(null);

    // 1. 랜덤 정답 포켓몬 선택
    const correctIndex = Math.floor(Math.random() * pokemonList.length);
    const target = pokemonList[correctIndex];

    // 2. 오답 3마리 무작위 추출
    const otherOptions = pokemonList
      .filter(p => p.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 3. 4개 보기 섞기
    const choices = [target, ...otherOptions].sort(() => Math.random() - 0.5);

    setCurrentQuiz(target);
    setOptions(choices);
  };

  useEffect(() => {
    generateNewQuiz();
  }, [pokemonList]);

  // 정답 선택 핸들러
  const handleSelect = (poke) => {
    if (isRevealed || !currentQuiz) return;

    setSelectedAnswer(poke.id);
    setIsRevealed(true);

    if (poke.id === currentQuiz.id) {
      // 정답인 경우: 스코어 증가 + 폭죽 + 울음소리 자동 재생
      setScore(prev => prev + 1);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      playAnimePokemonCry(currentQuiz.name);
    }
  };

  if (!currentQuiz) return null;

  const isCorrect = selectedAnswer === currentQuiz.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-amber-300 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 & 점수 영역 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-full font-black text-amber-900 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>맞힌 점수: {score}점</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 타이틀 안내 */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">
            {isRevealed ? (
              isCorrect ? '정답이에요! 🎉' : '아쉬워요! 다음엔 맞혀봐요!'
            ) : (
              '내가 누구게? 🤔'
            )}
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {isRevealed ? `${currentQuiz.name} 친구였어요!` : '그림자를 보고 이름을 맞혀보세요!'}
          </p>
        </div>

        {/* 실루엣 이미지 영역 */}
        <div className="relative flex justify-center items-center py-4 bg-amber-50/60 rounded-3xl border-2 border-dashed border-amber-200 overflow-hidden">
          <div className="absolute w-36 h-36 bg-amber-200/50 rounded-full blur-xl -z-0" />
          <img
            src={currentQuiz.imageUrl}
            alt="퀴즈 포켓몬"
            className={`w-40 h-40 object-contain relative z-10 transition-all duration-500 drop-shadow-md select-none pointer-events-none ${
              isRevealed ? 'brightness-100 scale-105' : 'brightness-0 contrast-200 opacity-90'
            }`}
          />
        </div>

        {/* 힌트: 울음소리 듣기 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={() => playAnimePokemonCry(currentQuiz.name)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black text-xs rounded-full shadow-sm transition-transform"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>목소리 힌트 듣기</span>
          </button>
        </div>

        {/* 4지선다 보기 버튼 목록 */}
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((option) => {
            const isTarget = option.id === currentQuiz.id;
            const isPicked = selectedAnswer === option.id;

            let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700';

            if (isRevealed) {
              if (isTarget) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black scale-102';
              } else if (isPicked && !isTarget) {
                btnStyle = 'bg-rose-400 border-rose-500 text-white line-through opacity-80';
              } else {
                btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={isRevealed}
                className={`py-3 px-2 rounded-2xl border-2 font-black text-base shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${btnStyle}`}
              >
                {isRevealed && isTarget && <CheckCircle2 className="w-4 h-4" />}
                {isRevealed && isPicked && !isTarget && <AlertCircle className="w-4 h-4" />}
                <span>{option.name}</span>
              </button>
            );
          })}
        </div>

        {/* 문제 푼 후 다음 문제 넘어가기 버튼 */}
        {isRevealed && (
          <button
            onClick={generateNewQuiz}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-base rounded-2xl shadow-lg transition-transform flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 animate-spin-reverse" />
            <span>다음 문제 풀기!</span>
          </button>
        )}
      </div>
    </div>
  );
}