// 한글 19개 초성 목록
const CHOSUNG_LIST = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  
  /**
   * 단어에서 초성만 추출합니다.
   * @example getChosung("피카츄") => "ㅍㅋㅊ"
   */
  export function getChosung(text) {
    if (!text) return '';
    let chosung = '';
  
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i) - 44032; // 한글 유니코드 시작점(0xAC00)
      // 완성형 한글 범위 내에 있는 경우
      if (code >= 0 && code <= 11171) {
        const chosungIndex = Math.floor(code / 588);
        chosung += CHOSUNG_LIST[chosungIndex];
      } else {
        // 영문, 숫자, 기호 또는 이미 자음인 경우 그대로 유지
        chosung += text.charAt(i);
      }
    }
  
    return chosung;
  }
  
  /**
   * 일반 검색어 또는 초성 검색어를 모두 지원하는 매칭 함수
   * @param {string} target - 대상 포켓몬 이름 (예: "피카츄")
   * @param {string} query - 입력 검색어 (예: "피카", "ㅍㅋ", "ㅊ")
   */
  export function matchHangulSearch(target, query) {
    if (!query) return true;
    if (!target) return false;
  
    const normalizedTarget = target.toLowerCase().replace(/\s+/g, '');
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
  
    // 1. 일반 텍스트 부분 일치 (예: "피카" -> "피카츄")
    if (normalizedTarget.includes(normalizedQuery)) {
      return true;
    }
  
    // 2. 초성 일치 검사 (예: "ㅍㅋㅊ" -> "피카츄", "ㅋㅊ" -> "피카츄")
    const targetChosung = getChosung(normalizedTarget);
    return targetChosung.includes(normalizedQuery); 
  }