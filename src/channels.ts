import { Channel, MatchFixture } from './types';
import { ALL_CHANNELS } from './channels_list';

export const DEFAULT_CHANNELS: Channel[] = ALL_CHANNELS;

export const WORLD_CUP_FIXTURES: MatchFixture[] = [
  {
    id: 'm1',
    homeTeam: { nameBN: 'আর্জেন্টিনা', nameEN: 'Argentina', code: 'ARG', flag: '🇦🇷' },
    awayTeam: { nameBN: 'ফ্রান্স', nameEN: 'France', code: 'FRA', flag: '🇫🇷' },
    group: 'Group A',
    date: '2026-06-22',
    time: '20:00',
    stadiumBN: 'মেটলাইফ স্টেডিয়াম, নিউ ইয়র্ক',
    stadiumEN: 'MetLife Stadium, New York'
  },
  {
    id: 'm2',
    homeTeam: { nameBN: 'ব্রাজিল', nameEN: 'Brazil', code: 'BRA', flag: '🇧🇷' },
    awayTeam: { nameBN: 'জার্মানি', nameEN: 'Germany', code: 'GER', flag: '🇩🇪' },
    group: 'Group C',
    date: '2026-06-23',
    time: '23:00',
    stadiumBN: 'অ্যাজটেকা স্টেডিয়াম, মেক্সিকো সিটি',
    stadiumEN: 'Estadio Azteca, Mexico City'
  },
  {
    id: 'm3',
    homeTeam: { nameBN: 'ইউএসএ', nameEN: 'USA', code: 'USA', flag: '🇺🇸' },
    awayTeam: { nameBN: 'ইংল্যান্ড', nameEN: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    group: 'Group B',
    date: '2026-06-24',
    time: '02:00',
    stadiumBN: 'সোফি স্টেডিয়াম, লস অ্যাঞ্জেলেস',
    stadiumEN: 'SoFi Stadium, Los Angeles'
  },
  {
    id: 'm4',
    homeTeam: { nameBN: 'স্পেন', nameEN: 'Spain', code: 'ESP', flag: '🇪🇸' },
    awayTeam: { nameBN: 'পর্তুগাল', nameEN: 'Portugal', code: 'POR', flag: '🇵🇹' },
    group: 'Group F',
    date: '2026-06-25',
    time: '18:00',
    stadiumBN: 'বিসি প্লেস, ভ্যাঙ্কুভার',
    stadiumEN: 'BC Place, Vancouver'
  },
  {
    id: 'm5',
    homeTeam: { nameBN: 'ইতালি', nameEN: 'Italy', code: 'ITA', flag: '🇮🇹' },
    awayTeam: { nameBN: 'মরক্কো', nameEN: 'Morocco', code: 'MAR', flag: '🇲🇦' },
    group: 'Group E',
    date: '2026-06-26',
    time: '21:00',
    stadiumBN: 'মের্সিডিজ-বেঞ্জ স্টেডিয়াম, আটলান্টা',
    stadiumEN: 'Mercedes-Benz Stadium, Atlanta'
  }
];
