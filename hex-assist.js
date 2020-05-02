const HexAssist = (() => {
    // VERSION INFORMATION
    const HexAssist_Author = "Reaver01";
    const HexAssist_Version = "0.0.2";

    // FUNCTIONS
    // Handles Token Movement.
    const hookOnUpdateToken = function (scene, actor) {

        if (!game.user.isGM || actor.name !== game.settings.get("Hex-Assist", "tokenName") || scene.data.gridType !== 4) {
            return;
        }

        const gridSize = canvas.grid.size;
        const v0 = gridSize * 0.866666;
        const v1 = gridSize * 0.433333;
        const v2 = gridSize * 0.75;
        const range = gridSize / 2;
        const sceneTiles = canvas.scene.data.tiles.reduce((updates, t) => {
            if (t.img.indexOf(game.settings.get("Hex-Assist", "tileName")) > -1 && t.hidden === false && (
                    (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y - range && t.y < actor.y + range) ||
                    (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y + v0 - range && t.y < actor.y + v0 + range) ||
                    (t.x > actor.x - v2 - range && t.x < actor.x - v2 + range && t.y > actor.y + v1 - range && t.y < actor.y + v1 + range) ||
                    (t.x > actor.x + v2 - range && t.x < actor.x + v2 + range && t.y > actor.y + v1 - range && t.y < actor.y + v1 + range) ||
                    (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y - v0 - range && t.y < actor.y - v0 + range) ||
                    (t.x > actor.x - v2 - range && t.x < actor.x - v2 + range && t.y > actor.y - v1 - range && t.y < actor.y - v1 + range) ||
                    (t.x > actor.x + v2 - range && t.x < actor.x + v2 + range && t.y > actor.y - v1 - range && t.y < actor.y - v1 + range)
                )) {
                updates.push({
                    _id: t._id,
                    "hidden": true,
                });
                return updates;
            } else {
                return updates;
            }
        }, []);
        const updates = sceneTiles;
        scene.updateEmbeddedEntity("Tile", updates);

    };

    // HOOKS
    Hooks.on("ready", function () {
        Hooks.on("updateToken", (scene, actorData) => {
            hookOnUpdateToken(scene, actorData);
        });
    });

    Hooks.once("init", () => {
        game.settings.register("Hex-Assist", "tokenName", {
            name: "Location Token Name",
            hint: "Name of token you are using to display player position on the map.",
            scope: "world",
            config: true,
            default: "Player Location",
            type: String
        });
        game.settings.register("Hex-Assist", "actualName", {
            name: "Actual Location Token Name",
            hint: "Name of token you are using to display actual player position on the map.",
            scope: "world",
            config: true,
            default: "Actual Location",
            type: String
        });
        game.settings.register("Hex-Assist", "tileName", {
            name: "Fog of War Tile Name",
            hint: "The filename for the Tile image you are using for Fog of War.",
            scope: "world",
            config: true,
            default: "tile.png",
            type: String
        });
    });
})();