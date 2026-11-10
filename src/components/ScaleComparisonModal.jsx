import React, { useState } from 'react';
import { X, Ruler, Scale, Sparkles, Plus, Minus } from 'lucide-react';

export default function ScaleComparisonModal({ pokemon, onClose }) {
  // 아이 기본값 (로컬스토리지에 저장되어 다음에도 유지됨)
  const [kidHeight, setKidHeight] = useState(() => {
    return Number(localStorage.getItem('kid_height')) || 115; // 단위: cm
  });
  const [kidWeight, setKidWeight] = useState(() => {
    return Number(localStorage.getItem('kid_weight')) || 20; // 단위: kg
  });

  const updateHeight = (delta) => {
    const next = Math.max(70, Math.min(180, kidHeight + delta));
    setKidHeight(next);
    localStorage.setItem('kid_height', next);
  };

  const updateWeight = (delta) => {
    const next = Math.max(10, Math.min(100, kidWeight + delta));
    setKidWeight(next);
    localStorage.setItem('kid_weight', next);
  };

  const pokeHeightCm = Math.round((pokemon.height || 0.4) * 100);
  const pokeWeightKg = pokemon.weight || 6;

  // 화면 내 최대 키(둘 중 큰 값)를 기준으로 상대 % 높이 계산
  const maxHeight = Math.max(kidHeight, pokeHeightCm, 120);
  const kidHeightPercent = Math.max(15, (kidHeight / maxHeight) * 100);
  const pokeHeightPercent = Math.max(15, (pokeHeightCm / maxHeight) * 100);

  // 시소 각도 계산 (몸무게 비교)
  const weightDiff = pokeWeightKg - kidWeight;
  const seesawAngle = Math.max(-18, Math.min(18, (weightDiff / 25) * 12));

  // 재미있는 비교 문구 생성
  const getHeightMessage = () => {
    if (Math.abs(kidHeight - pokeHeightCm) <= 5) return '나랑 키가 거의 똑같아요! 쌍둥이 친구! 🤩';
    if (kidHeight > pokeHeightCm) {
      const diff = kidHeight - pokeHeightCm;
      return `나보다 ${diff}cm 작아요! 폭 안아줄 수 있어요! 🥰`;
    }
    const diff = pokeHeightCm - kidHeight;
    return `나보다 ${diff}cm 더 커요! 우와, 올려다봐야겠어요! 🦒`;
  };

  const getWeightMessage = () => {
    const times = (pokeWeightKg / kidWeight).toFixed(1);
    if (times > 1.2) return `나보다 무거워요! (내 몸무게의 약 ${times}배) 🐘`;
    if (times < 0.8) return `나보다 훨씬 가벼워요! 깃털처럼 들 수 있을지도? 🪶`;
    return '나랑 몸무게가 아주 비슷해요! ⚖️';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-amber-300 rounded-3xl max-w-sm w-full p-4 relative shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 상단 타이틀 */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>실감 크기 비교</span>
          </div>
          <h2 className="text-xl font-black text-slate-800">
            나랑 {pokemon.name}는 얼마나 다를까?
          </h2>
        </div>

        {/* 내 정보 간단 조절 바 */}
        <div className="grid grid-cols-2 gap-2 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200">
          {/* 키 조절 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-amber-900">내 키</span>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => updateHeight(-5)}
                className="w-6 h-6 rounded-full bg-white shadow-xs border border-amber-300 flex items-center justify-center active:scale-90 text-amber-900 font-bold"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-black text-sm text-slate-800 w-12 text-center">
                {kidHeight}cm
              </span>
              <button
                onClick={() => updateHeight(5)}
                className="w-6 h-6 rounded-full bg-white shadow-xs border border-amber-300 flex items-center justify-center active:scale-90 text-amber-900 font-bold"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 몸무게 조절 */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-amber-900">내 몸무게</span>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => updateWeight(-2)}
                className="w-6 h-6 rounded-full bg-white shadow-xs border border-amber-300 flex items-center justify-center active:scale-90 text-amber-900 font-bold"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-black text-sm text-slate-800 w-12 text-center">
                {kidWeight}kg
              </span>
              <button
                onClick={() => updateWeight(2)}
                className="w-6 h-6 rounded-full bg-white shadow-xs border border-amber-300 flex items-center justify-center active:scale-90 text-amber-900 font-bold"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. 키 비교 무대 (바닥선 기준) */}
        <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex items-center gap-1 text-sky-900 font-black text-xs">
            <Ruler className="w-3.5 h-3.5" />
            <span>키 재보기</span>
          </div>

          <div className="relative h-44 flex items-end justify-around border-b-4 border-amber-400/80 px-4 pt-4">
            {/* 아이 캐릭터 */}
            <div
              className="flex flex-col items-center justify-end transition-all duration-300"
              style={{ height: `${kidHeightPercent}%` }}
            >
              <span className="text-[10px] font-black text-sky-800 mb-0.5">{kidHeight}cm</span>
              <div className="w-10 h-full bg-sky-400 rounded-t-2xl border-2 border-sky-500 flex flex-col items-center justify-start pt-1.5 shadow-xs">
                <span className="text-sm">🧒</span>
                <span className="text-[9px] font-black text-white mt-auto pb-1">나</span>
              </div>
            </div>

            {/* 포켓몬 일러스트 */}
            <div
              className="flex flex-col items-center justify-end transition-all duration-300"
              style={{ height: `${pokeHeightPercent}%` }}
            >
              <span className="text-[10px] font-black text-amber-900 mb-0.5">{pokeHeightCm}cm</span>
              <img
                src={pokemon.imageUrl}
                alt={pokemon.name}
                className="w-auto h-full max-h-full object-contain drop-shadow-md"
              />
              <span className="text-[9px] font-black text-amber-950 truncate max-w-[70px]">
                {pokemon.name}
              </span>
            </div>
          </div>

          <p className="text-center text-xs font-black text-sky-900 pt-1">
            {getHeightMessage()}
          </p>
        </div>

        {/* 2. 몸무게 시소 비교 */}
        <div className="bg-orange-50/60 p-3 rounded-2xl border border-orange-100 space-y-2">
          <div className="flex items-center gap-1 text-orange-950 font-black text-xs">
            <Scale className="w-3.5 h-3.5" />
            <span>몸무게 시소</span>
          </div>

          <div className="py-2 flex flex-col items-center">
            {/* 시소 판자 */}
            <div
              className="w-64 h-2.5 bg-amber-700 rounded-full flex justify-between items-center px-2 transition-transform duration-500 relative"
              style={{ transform: `rotate(${seesawAngle}deg)` }}
            >
              {/* 왼쪽: 나 */}
              <div className="absolute -top-7 left-2 flex flex-col items-center">
                <span className="text-xs">🧒</span>
                <span className="text-[9px] font-black text-slate-700 bg-white/90 px-1 rounded-sm border">
                  {kidWeight}kg
                </span>
              </div>

              {/* 오른쪽: 포켓몬 */}
              <div className="absolute -top-7 right-2 flex flex-col items-center">
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[9px] font-black text-slate-700 bg-white/90 px-1 rounded-sm border">
                  {pokeWeightKg}kg
                </span>
              </div>
            </div>

            {/* 시소 받침대 삼각대 */}
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-amber-500 mt-0.5" />
          </div>

          <p className="text-center text-xs font-black text-orange-950 pt-1">
            {getWeightMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}