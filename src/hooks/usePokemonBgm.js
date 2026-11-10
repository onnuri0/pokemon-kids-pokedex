import { useState, useRef, useEffect } from 'react';

// 아이들이 좋아할 만한 대표 배경음악 목록
export const BGM_TRACKS = [
  {
    title: '모험의 시작 (태초마을)',
    url: 'https://ia800705.us.archive.org/26/items/PokemonRedBlueYellowSoundtrack/02%20Pallet%20Town%20Theme.mp3'
  },
  {
    title: '신나는 체육관 관장 배틀',
    url: 'https://ia800705.us.archive.org/26/items/PokemonRedBlueYellowSoundtrack/22%20Battle%20%28Gym%20Leader%29.mp3'
  },
  {
    title: '포켓몬센터 치유 테마',
    url: 'https://ia800705.us.archive.org/26/items/PokemonRedBlueYellowSoundtrack/10%20Pokemon%20Center.mp3'
  }
];

export function usePokemonBgm() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Audio 객체 초기화
    audioRef.current = new Audio(BGM_TRACKS[currentTrackIndex].url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25; // 배경음이므로 볼륨을 은은하게(25%) 설정

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 트랙 변경 시 오디오 교체
  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.src = BGM_TRACKS[currentTrackIndex].url;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch(e => console.warn('BGM 재생 에러:', e));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('사용자 상호작용 필요:', err));
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % BGM_TRACKS.length);
  };

  return {
    isPlaying,
    togglePlay,
    nextTrack,
    currentTrack: BGM_TRACKS[currentTrackIndex]
  };
}