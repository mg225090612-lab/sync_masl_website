export interface ChampionRecord {
  season: string;
  winner: string;
  class: string;
  photo: string;
}

export interface ChampionItem {
  sport: string;
  emoji: string;
  history: ChampionRecord[];
}
