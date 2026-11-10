/**
 * 브라우저에 설치된 한국어 음성 중 가장 명료한 기본 음성을 탐색합니다.
 */
function getKoreanVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
  
    // 자연스럽고 깔끔한 한국어 음성 우선 선택
    return (
      voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuna'))) ||
      voices.find(v => v.lang === 'ko-KR') ||
      voices.find(v => v.lang.startsWith('ko')) ||
      null
    );
  }
  
  /**
   * 변조 없이 담백하고 또박또박한 표준 발음으로 이름을 읽어줍니다.
   * @param {string} name - 포켓몬 이름
   */
  export function playAnimePokemonCry(name) {
    if (!('speechSynthesis' in window)) return;
  
    // 기존 진행 중인 음성 즉시 정지
    window.speechSynthesis.cancel();
  
    // 군더더기 없이 정확한 이름만 낭독 (예: "피카츄")
    const utterance = new SpeechSynthesisUtterance(name);
  
    utterance.lang = 'ko-KR';
    utterance.pitch = 1.0; // 표준 기본 음높이 (변조 제거)
    utterance.rate = 1.0;  // 표준 말하기 속도
  
    const voice = getKoreanVoice();
    if (voice) {
      utterance.voice = voice;
    }
  
    window.speechSynthesis.speak(utterance);
  }