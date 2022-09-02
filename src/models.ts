export interface IGameState {
  players: IPlayer[];
  coins: ICoin[];
  fieldSize: {
    width: number;
    height: number;
  };
  eliminatedPlayers: Record<string, string>;
  weapons: IWeapon[];
}

export interface IPlayer {
  id: string;
  name: string;
  score: number;
  x: number;
  y: number;
  power: number;
}

export interface ICoin {
  x: number;
  y: number;
  isDeadly?: boolean;
}

export interface IWeapon {
  x: number;
  y: number;
  power: 5 | 10 | 15;
}

export type Command = 'left' | 'right' | 'up' | 'down';
export type Commands = Record<string, Command>;
