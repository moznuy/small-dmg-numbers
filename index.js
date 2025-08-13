exports.NetworkMod = function ShortDmgNumbers(mod) {
  const DmgType = 1;
  let players = new Set();

  mod.hook("S_SPAWN_USER", 16, (event) => {
    // players[event.gameId] = true;
    players.add(event.gameId);
  });
  mod.hook("S_DESPAWN_USER", 3, (event) => {
    // delete players[event.gameId];
    players.delete(players.gameId);
  });
  mod.game.me.on("change_zone", () => players.clear());

  mod.hook("S_EACH_SKILL_RESULT", 14, { order: 100 }, (event) => {
    const myGameId = mod.game.me.gameId;
    if (!mod.settings.enabled || mod.game.me.level < 65) return;
    if (event.type !== DmgType) return;
    if (myGameId !== event.source && myGameId !== event.owner) return;

    const isPvP = players.has(event.target);
    const smallDmg = event.value / (isPvP ? BigInt(mod.settings.pvp_divisor) : BigInt(mod.settings.pve_divisor));
    event.value = smallDmg < 1n ? 1n : smallDmg;
    return true;
  });

  // Bunch of useless commands
  mod.command.add("smn", {
    on() {
      if (mod.settings.enabled) return mod.command.message("Already enabled.");
      mod.settings.enabled = true;
      mod.command.message("Module enabled.");
    },
    off() {
      if (!mod.settings.enabled) return mod.command.message("Already disabled.");
      mod.settings.enabled = false;
      mod.command.message("Module disabled.");
    },
    pve(v) {
      const value = +v;
      if (!value) return mod.command.message("Innapropiate or missing value.");
      mod.settings.pve_divisor = value;
      mod.command.message("Pve divisor set to " + mod.settings.pve_divisor + ".");
    },
    pvp(v) {
      const value = +v;
      if (!value) return mod.command.message("Innapropiate or missing value.");
      mod.settings.pvp_divisor = value;
      mod.command.message("Pvp divisor set to " + mod.settings.pvp_divisor + ".");
    },
    $default() {
      mod.command.message("Usage: on / off / pve [value] / pvp [value]");
    },
  });
};
