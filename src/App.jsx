import React, { useState, useEffect } from 'react';
import { fetchPokemonRange, fetchPokemonDetail } from './services/pokeApi';
import { TYPE_CONFIG } from './data/pokemonData';
import { playAnimePokemonCry } from './utils/pokemonVoice';
import { matchHangulSearch } from './utils/hangul';
import { 
  Volume2, BookOpen, Heart, X, Loader2, Gamepad2, Search, 
  Mic, MicOff, Sparkles, Ruler 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SilhouetteQuiz from './components/SilhouetteQuiz';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import ScaleComparisonModal from './components/ScaleComparisonModal';

const QUICK_CHOSUNG = ['전체', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const GENERATIONS = [
  { label: '1세대', start: 1, end: 151 },
  { label: '2세대', start: 152, end: 251 },
  { label: '3세대', start: 252, end: 386 },
  { label: '4세대', start: 387, end: 493 },
  { label: '5세대', start: 494, end: 649 },
  { label: '6세대', start: 650, end: 721 },
  { label: '7세대', start: 722, end: 809 },
  { label: '8세대', start: 810, end: 905 },
  { label: '9세대', start: 906, end: 1025 },
];

export default function App() {
  const [selectedGen, setSelectedGen] = useState(0);
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePokemon, setActivePokemon] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isEvoLoading, setIsEvoLoading] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [scaleTargetPokemon, setScaleTargetPokemon] = useState(null);

  // 음성 인식 훅 연결
  const { isListening, toggleListening } = useVoiceRecognition((spokenText) => {
    setSearchTerm(spokenText);
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('poke_favs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const targetGen = GENERATIONS[selectedGen];
      const data = await fetchPokemonRange(targetGen.start, targetGen.end);
      setPokemonList(data || []);
      setLoading(false);
    }
    loadData();
  }, [selectedGen]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const exists = prev.includes(id);
      if (!exists) {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        const updated = [...prev, id];
        localStorage.setItem('poke_favs', JSON.stringify(updated));
        return updated;
      }
      const updated = prev.filter(item => item !== id);
      localStorage.setItem('poke_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const speakText = (name, text, e) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(`${name}. ${text}`);
    msg.lang = 'ko-KR';
    msg.rate = 0.95;
    msg.pitch = 1.0;
    window.speechSynthesis.speak(msg);
  };

  const handleEvolutionClick = async (evoId, fallbackName) => {
    const matched = pokemonList.find(p => p.id === evoId);
    if (matched) {
      setActivePokemon(matched);
      playAnimePokemonCry(matched.name);
      return;
    }

    setIsEvoLoading(true);
    try {
      const detail = await fetchPokemonDetail(evoId);
      if (detail) {
        setActivePokemon(detail);
        playAnimePokemonCry(detail.name);
      } else {
        playAnimePokemonCry(fallbackName);
      }
    } catch (err) {
      console.error('진화 정보 조회 실패:', err);
      playAnimePokemonCry(fallbackName);
    } finally {
      setIsEvoLoading(false);
    }
  };

  const filteredList = pokemonList.filter(poke => {
    const matchesFav = onlyFavorites ? favorites.includes(poke.id) : true;
    const matchesType = selectedType === '전체' ? true : poke.types.includes(selectedType);
    const matchesSearch = matchHangulSearch(poke.name, searchTerm);
    return matchesFav && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-100/40 text-slate-800 pb-20 select-none">
      {/* 컴팩트 헤더 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 px-3 sm:px-5 py-2.5 shadow-sm space-y-2.5">
        {/* 상단 1줄: 로고 + 퀴즈 + 하트 즐겨찾기 */}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl sm:text-3xl animate-bounce">⚡</span>
            <h1 className="text-lg sm:text-2xl font-black text-amber-900 tracking-tight">
              키즈 포켓몬
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-xs transition-transform"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>퀴즈!</span>
            </button>

            <button
              onClick={() => setOnlyFavorites(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full font-black text-xs sm:text-sm border transition-all active:scale-95 ${
                onlyFavorites
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'fill-rose-500'}`} />
              <span>{favorites.length}</span>
            </button>
          </div>
        </div>

        {/* 세대 선택 탭 */}
        <div className="max-w-4xl mx-auto flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {GENERATIONS.map((gen, idx) => (
            <button
              key={gen.label}
              onClick={() => {
                setSelectedGen(idx);
                setSearchTerm('');
              }}
              className={`px-3 py-1 rounded-full font-black text-xs whitespace-nowrap transition-transform active:scale-95 ${
                selectedGen === idx
                  ? 'bg-amber-500 text-white shadow-xs scale-102'
                  : 'bg-amber-100/70 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {gen.label}
            </button>
          ))}
        </div>

        {/* 검색창 + 마이크 */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-amber-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isListening ? "듣고 있어요! 말씀해주세요..." : "이름이나 초성 검색 (ㅍㅋㅊ)"}
              className={`w-full pl-9 pr-8 py-2 rounded-2xl font-black text-xs sm:text-sm text-slate-800 outline-none transition-all border-2 ${
                isListening 
                  ? 'bg-rose-50 border-rose-400 placeholder-rose-600 animate-pulse' 
                  : 'bg-amber-50/70 focus:bg-white border-amber-300 focus:border-amber-500 placeholder-amber-700/50'
              }`}
            />
            {searchTerm && !isListening && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 p-0.5 rounded-full bg-slate-200 text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-2xl border-2 font-black transition-all active:scale-90 shadow-xs flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-200 animate-bounce'
                : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* 한글 초성 칩 */}
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto py-0.5 items-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_CHOSUNG.map(char => {
            const isSelected = char === '전체' ? searchTerm === '' : searchTerm === char;
            return (
              <button
                key={char}
                onClick={() => setSearchTerm(char === '전체' ? '' : char)}
                className={`px-2.5 py-0.5 rounded-lg font-black text-xs whitespace-nowrap transition-transform active:scale-90 ${
                  isSelected
                    ? 'bg-amber-500 text-white scale-105 shadow-xs'
                    : 'bg-white text-slate-700 border border-amber-200/80'
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>

        {/* 18개 정규 타입 칩 */}
        <div className="max-w-4xl mx-auto flex gap-1.5 overflow-x-auto pt-0.5 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            '전체', '노말', '불꽃', '물', '풀', '전기', '얼음', 
            '격투', '독', '땅', '비행', '에스퍼', '벌레', 
            '바위', '고스트', '드래곤', '강철', '악', '페어리'
          ].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs whitespace-nowrap transition-transform active:scale-95 shadow-xs ${
                selectedType === type
                  ? 'bg-amber-500 text-white ring-2 ring-amber-200 scale-102'
                  : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
              }`}
            >
              <span>{TYPE_CONFIG[type]?.icon || '✨'}</span>
              <span>{type}</span>
            </button>
          ))}
        </div>
      </header>

      {/* 리스트 본문 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-black text-amber-800 animate-pulse">
            포켓몬 친구들을 데려오는 중... ✨
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <span className="text-4xl">🔍</span>
          <p className="text-base font-black text-slate-600">친구가 보이지 않아요!</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedType('전체'); setOnlyFavorites(false); }}
            className="px-3 py-1.5 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs active:scale-95"
          >
            다시 전체보기
          </button>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-3 sm:px-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredList.map(poke => {
              const primary = poke.types[0];
              const theme = TYPE_CONFIG[primary] || TYPE_CONFIG['노말'];
              const isFav = favorites.includes(poke.id);

              return (
                <div
                  key={poke.id}
                  onClick={() => setActivePokemon(poke)}
                  className={`relative rounded-2xl p-2.5 sm:p-3.5 border-2 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95 flex flex-col justify-between ${theme.cardBg}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 bg-white/80 rounded-full text-slate-500">
                      #{String(poke.id).padStart(3, '0')}
                    </span>
                    <button
                      onClick={e => toggleFavorite(poke.id, e)}
                      className="p-1 rounded-full bg-white/90 hover:bg-white active:scale-125 transition-transform"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="my-1.5 flex justify-center items-center relative group">
                    <div className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-white/70 rounded-full blur-xs" />
                    <img
                      src={poke.imageUrl}
                      alt={poke.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-xs transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 truncate">
                      {poke.name}
                    </h3>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {poke.types.map(t => (
                        <span
                          key={t}
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.2 rounded-full ${
                            TYPE_CONFIG[t]?.badge || 'bg-slate-400 text-white'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 mt-2.5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playAnimePokemonCry(poke.name);
                      }}
                      className="flex items-center justify-center gap-0.5 py-1 rounded-lg bg-white/90 font-black text-[10px] sm:text-xs text-slate-700 shadow-2xs border border-slate-200 active:scale-95"
                    >
                      <Volume2 className="w-3 h-3 text-amber-500" />
                      이름
                    </button>
                    <button
                      onClick={e => speakText(poke.name, poke.description, e)}
                      className="flex items-center justify-center gap-0.5 py-1 rounded-lg bg-white/90 font-black text-[10px] sm:text-xs text-slate-700 shadow-2xs border border-slate-200 active:scale-95"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-500" />
                      이야기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 모바일/패드 최적화 팝업 모달 */}
      {activePokemon && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setActivePokemon(null)}
        >
          <div
            className="bg-white border-4 border-amber-300 rounded-3xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5 relative shadow-xl space-y-3 max-h-[88vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePokemon(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full bg-slate-100 text-slate-500 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                #{String(activePokemon.id).padStart(3, '0')}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">{activePokemon.name}</h2>
              {isEvoLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
            </div>

            <div className="flex justify-center py-2 bg-amber-50/50 rounded-2xl relative">
              <img
                src={activePokemon.imageUrl}
                alt={activePokemon.name}
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md"
              />
            </div>

            {/* ⭐ 정상 위치: 상세 모달 내부의 크기 정보 & 크기 비교 버튼 ⭐ */}
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="text-left font-bold text-slate-700 text-xs">
                <div>{activePokemon.category}</div>
                <div className="text-[11px] text-slate-500">
                  키 {activePokemon.height}m · 몸무게 {activePokemon.weight}kg
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScaleTargetPokemon(activePokemon)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-transform"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>나랑 비교!</span>
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <p className="text-slate-700 text-xs leading-relaxed font-bold">
                {activePokemon.description}
              </p>
            </div>

            {/* 진화 체인 뷰 */}
            {activePokemon.evolutions && activePokemon.evolutions.length > 1 && (
              <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between font-black text-amber-950 text-xs mb-1.5">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>진화 친구들</span>
                  </div>
                  <span className="text-[10px] text-amber-700">터치하면 소리가 나요!</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {activePokemon.evolutions.map((evo, idx) => {
                    const isCurrent = evo.id === activePokemon.id;
                    const targetEvo = pokemonList.find(p => p.id === evo.id);
                    const evoDisplayName = targetEvo ? targetEvo.name : `#${evo.id}`;

                    return (
                      <React.Fragment key={evo.id}>
                        {idx > 0 && <span className="text-amber-500 font-black text-xs">➔</span>}

                        <button
                          type="button"
                          onClick={() => handleEvolutionClick(evo.id, evoDisplayName)}
                          className={`flex flex-col items-center p-1.5 rounded-xl transition-all outline-none ${
                            isCurrent
                              ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105 shadow-xs'
                              : 'bg-white text-slate-600 active:scale-90'
                          }`}
                        >
                          <img
                            src={evo.imageUrl}
                            alt={evoDisplayName}
                            className="w-10 h-10 object-contain"
                            loading="lazy"
                          />
                          <span className="text-[10px] font-black mt-0.5 whitespace-nowrap">
                            {evoDisplayName}
                          </span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 실루엣 퀴즈 팝업 */}
      {isQuizOpen && (
        <SilhouetteQuiz
          pokemonList={pokemonList}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    
      {/* 크기 비교 팝업 모달 */}
      {scaleTargetPokemon && (
        <ScaleComparisonModal
          pokemon={scaleTargetPokemon}
          onClose={() => setScaleTargetPokemon(null)}
        />
      )}
    </div>
  );
}