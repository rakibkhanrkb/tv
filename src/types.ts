export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  groupTitle: string;
  isCustom?: boolean;
}

export interface MatchFixture {
  id: string;
  homeTeam: { nameBN: string; nameEN: string; code: string; flag: string };
  awayTeam: { nameBN: string; nameEN: string; code: string; flag: string };
  group: string;
  date: string; // ISO format or string
  time: string; // Time in BDT
  stadiumBN: string;
  stadiumEN: string;
}

export type Language = 'bn' | 'en';
