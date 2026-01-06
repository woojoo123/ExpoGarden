import { Character } from '@/types';

export const CHARACTERS: Character[] = [
  {
    id: 'character1',
    name: '전사',
    file: 'character.png',
    description: '강인한 전사 캐릭터',
  },
  {
    id: 'character2',
    name: '마법사',
    file: 'character2.png',
    description: '신비로운 마법사',
  },
  {
    id: 'character3',
    name: '궁수',
    file: 'character3.png',
    description: '민첩한 궁수',
  },
  {
    id: 'character4',
    name: '도적',
    file: 'character4.png',
    description: '재빠른 도적',
  },
];

export const getCharacterById = (id: string | null | undefined): Character | null => {
  if (!id) return null;
  return CHARACTERS.find(char => char.id === id) || null;
};

export const getCharacterFile = (id: string | null | undefined): string => {
  const character = getCharacterById(id);
  return character ? character.file : 'character.png'; // default
};

