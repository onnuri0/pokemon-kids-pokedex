// 한글 타입명 매핑
const TYPE_KO_MAP = {
    normal: '노말',
    fire: '불꽃',
    water: '물',
    grass: '풀',
    electric: '전기',
    ice: '얼음',
    fighting: '격투',
    poison: '독',
    ground: '땅',
    flying: '비행',
    psychic: '에스퍼',
    bug: '벌레',
    rock: '바위',
    ghost: '고스트',
    dragon: '드래곤',
    steel: '강철',
    dark: '악',
    fairy: '페어리',
  };
  
  /**
   * 진화 체인 트리에서 포켓몬 ID 목록을 재귀적으로 추출 (분기 진화 포함)
   */
  function extractEvolutions(chainNode) {
    const list = [];
  
    function traverse(node) {
      if (!node) return;
      const speciesUrl = node.species?.url || '';
      const parts = speciesUrl.split('/').filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10);
  
      if (id) list.push(id);
  
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach(child => traverse(child));
      }
    }
  
    traverse(chainNode);
    return list;
  }
  
  /**
   * 특정 포켓몬의 상세 정보 및 진화 정보 조회
   */
  export async function fetchPokemonDetail(id) {
    try {
      const [basicRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ]);
  
      if (!basicRes.ok || !speciesRes.ok) return null;
  
      const basicData = await basicRes.json();
      const speciesData = await speciesRes.json();
  
      // 1. 한국어 이름
      const koNameObj = speciesData.names.find(n => n.language.name === 'ko');
      const name = koNameObj ? koNameObj.name : basicData.name;
  
      // 2. 한국어 분류(예: 쥐포켓몬)
      const koGeneraObj = speciesData.genera.find(g => g.language.name === 'ko');
      const category = koGeneraObj ? koGeneraObj.genus : '포켓몬';
  
      // 3. 한국어 도감 설명
      const koFlavorTextObj = speciesData.flavor_text_entries
        .slice()
        .reverse()
        .find(f => f.language.name === 'ko');
      const description = koFlavorTextObj
        ? koFlavorTextObj.flavor_text.replace(/[\n\f]/g, ' ')
        : '신비로운 포켓몬 친구예요!';
  
      // 4. 진화 체인 조회 (⭐ 핵심 ⭐)
      let evolutionIds = [basicData.id];
      if (speciesData.evolution_chain?.url) {
        try {
          const evoRes = await fetch(speciesData.evolution_chain.url);
          if (evoRes.ok) {
            const evoData = await evoRes.json();
            evolutionIds = extractEvolutions(evoData.chain);
          }
        } catch (evoErr) {
          console.warn(`진화 정보 조회 실패 (#${id}):`, evoErr);
        }
      }
  
      const evolutions = evolutionIds.map(evoId => ({
        id: evoId,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
      }));
  
      // 5. 타입 변환
      const types = basicData.types.map(t => TYPE_KO_MAP[t.type.name] || t.type.name);
  
      return {
        id: basicData.id,
        name,
        category,
        types,
        height: basicData.height / 10,
        weight: basicData.weight / 10,
        imageUrl:
          basicData.sprites.other['official-artwork'].front_default ||
          basicData.sprites.front_default,
        cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,
        description,
        evolutions, // 진화 리스트 반환
      };
    } catch (err) {
      console.error(`포켓몬 #${id} 로딩 실패:`, err);
      return null;
    }
  }
  
  /**
   * 도감 번호 범위 일괄 패칭 (캐싱 포함)
   */
  export async function fetchPokemonRange(startId = 1, endId = 151) {
    const cacheKey = `POKEMON_KIDS_CACHE_RANGE_${startId}_${endId}`;
  
    // 캐시 확인
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // 기존 캐시에 evolutions 필드가 제대로 있는지 검증
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].evolutions) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('캐시 읽기 실패:', e);
    }
  
    // 새로 패칭
    const ids = [];
    for (let i = startId; i <= endId; i++) {
      ids.push(i);
    }
  
    const results = await Promise.all(ids.map(id => fetchPokemonDetail(id)));
    const validResults = results.filter(Boolean);
  
    try {
      if (validResults.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(validResults));
      }
    } catch (e) {
      console.warn('캐시 저장 실패:', e);
    }
  
    return validResults;
  }