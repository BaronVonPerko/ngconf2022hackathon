import { Commands, IGameState, IPlayer } from './models';

const coinCount = 100;
const weaponCount = 5;

export function getInitialState(): IGameState {
  return {
    players: [],
    coins: [],
    weapons: [],
    fieldSize: {
      width: 100,
      height: 100
    },
    eliminatedPlayers: {},
    gameLoad: false,
    meteors: [],
    meteorSpawnCounter: 100,
    lastMeteorSpawnTime: 100
  };
}

export function gameLogic(state: IGameState, commands: Commands): IGameState {
  evaluateCommands(state, commands);
  resolveCoinCollisions(state);
  resolveWeaponCollisions(state);
  resolvePlayerCollisions(state);
  resolveMeteorCollisions(state);
  addMoreCoins(state);
  handleMeteors(state);

  if (!state.gameLoad) {
    addWeapons(state);
  }
  state.gameLoad = true;

  return state;
}

function evaluateCommands(state: IGameState, commands: Commands) {
  Object.keys(commands).forEach((playerId) => {
    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }
    const command = commands[playerId];
    if (command === 'up') {
      const newY = player.y - 1;
      if (newY < 0) {
        return;
      }
      player.y = newY;
    } else if (command === 'down') {
      const newY = player.y + 1;
      if (newY > state.fieldSize.height) {
        return;
      }
      player.y = newY;
    } else if (command === 'left') {
      const newX = player.x - 1;
      if (newX < 0) {
        return;
      }
      player.x = newX;
    } else if (command === 'right') {
      const newX = player.x + 1;
      if (newX > state.fieldSize.width) {
        return;
      }
      player.x = newX;
    }
  });
}

function resolveCoinCollisions(state: IGameState) {
  state.coins.slice().forEach((coin) => {
    const player = state.players.find((p) => p.x === coin.x && p.y === coin.y);
    if (player) {
      player.score++;
      state.coins = state.coins.filter((c) => c !== coin);
    }
  });
}

function resolveWeaponCollisions(state: IGameState) {
  state.weapons.slice().forEach(weapon => {
    const player = state.players.find(p => p.x === weapon.x && p.y === weapon.y);
    if (player) {
      player.power += weapon.power;
      state.weapons = state.weapons.filter(w => w !== weapon);
    }
  });
}

function resolvePlayerCollisions(state: IGameState) {
  state.players.slice().forEach((player) => {
    if (!state.players.includes(player)) {
      return;
    }
    const otherPlayer = state.players.find(
      (p) => p !== player && p.x === player.x && p.y === player.y
    );
    if (otherPlayer) {
      const pool = (player.power || 1) + (otherPlayer.power || 1);
      const roll = Math.floor(Math.random() * pool);
      let winner: IPlayer;
      let loser: IPlayer;
      if (roll <= (player.power || 1)) {
        winner = player;
        loser = otherPlayer;
      } else {
        winner = otherPlayer;
        loser = player;
      }
      winner.score += loser.score;
      winner.power += loser.power;
      state.players = state.players.filter((p) => p !== loser);
      state.eliminatedPlayers[loser.id] = winner.id;
    }
  });
}

function resolveMeteorCollisions(state: IGameState) {
  state.players.slice().forEach((player) => {

    const meteor = state.meteors
      .filter(m => m.launchTimer <= 0)
      .find(m => m.x === player.x && m.y === player.y);

    if (meteor) {
      state.meteors = state.meteors.filter(m => m !== meteor);
      player.power = 0;
      player.score = 0;
    }

  });
}

function addMoreCoins(state: IGameState) {
  while (state.coins.length < coinCount) {
    const location = getUnoccupiedLocation(state);
    const isDeadly = Math.floor(Math.random() * 2) === 1;
    state.coins.push({ ...location, isDeadly });
  }
}

function addWeapons(state: IGameState) {
  while (state.weapons.length < weaponCount) {
    const location = getUnoccupiedLocation(state);
    const power = Math.floor((Math.random() * 3) * 5);
    state.weapons.push({ ...location, power });
  }
}

function handleMeteors(state: IGameState) {
  state.meteorSpawnCounter -= 1;

  state.meteors.forEach(meteor => {
    if (meteor.launchTimer) {
      meteor.visible = !meteor.visible;
      meteor.launchTimer--;
    } else {
      meteor.visible = true;
      meteor.x += meteor.velocityX;
      meteor.y += meteor.velocityY;
    }
  });

  if (state.meteorSpawnCounter <= 0) {
    const newSpawnTime = state.lastMeteorSpawnTime === 20 ? 20 : state.lastMeteorSpawnTime - 20;
    state.meteorSpawnCounter = newSpawnTime;
    state.lastMeteorSpawnTime = newSpawnTime;

    const location = getUnoccupiedLocation(state);
    let velocityX = Math.floor(Math.random() * 3) - 1;
    let velocityY = Math.floor(Math.random() * 3) - 1;

    if (velocityY === 0 && velocityX === 0) {
      velocityX = 1;
      velocityY = 1;
    }

    state.meteors.push({ ...location, launchTimer: 15, velocityX, velocityY, visible: true });
  }
}

export function getUnoccupiedLocation(state: IGameState): {
  x: number;
  y: number;
} {
  let location = null;
  while (!location) {
    const x = Math.floor(Math.random() * state.fieldSize.width);
    const y = Math.floor(Math.random() * state.fieldSize.height);
    if (state.players.find((p) => p.x === x && p.y === y)) {
      continue;
    }
    if (state.coins.find((c) => c.x === x && c.y === y)) {
      continue;
    }
    if (state.weapons.find((c) => c.x === x && c.y === y)) {
      continue;
    }
    location = { x, y };
  }
  return location;
}
