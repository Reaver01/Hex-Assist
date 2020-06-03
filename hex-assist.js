const HexAssist = (() => {
    const hookOnUpdateToken = function(scene, actor) {

        const gridType = scene.data.gridType;

        if (!game.user.isGM || actor.name !== game.settings.get("Hex-Assist", "tokenName") || (gridType !== 4 && gridType !== 2)) {
            return;
        }

        const gridSize = canvas.grid.size;
        const v0 = gridSize * 0.866666;
        let v1 = gridSize * 0.433333;
        let v2 = gridSize * 0.75;
        if (gridType === 2) {
            v1 = gridSize * 0.75;
            v2 = gridSize * 0.433333;
        }
        const range = gridSize / 2;
        const sceneTiles = canvas.scene.data.tiles.reduce((updates, t) => {
            if (t.img.indexOf(game.settings.get("Hex-Assist", "tileName")) > -1 && t.hidden === false && (
                    (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y - range && t.y < actor.y + range) ||
                    (gridType === 4 && (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y + v0 - range && t.y < actor.y + v0 + range)) ||
                    (gridType === 2 && (t.y > actor.y - range && t.y < actor.y + range && t.x > actor.x + v0 - range && t.x < actor.x + v0 + range)) ||
                    (t.x > actor.x - v2 - range && t.x < actor.x - v2 + range && t.y > actor.y + v1 - range && t.y < actor.y + v1 + range) ||
                    (t.x > actor.x + v2 - range && t.x < actor.x + v2 + range && t.y > actor.y + v1 - range && t.y < actor.y + v1 + range) ||
                    (gridType === 4 && (t.x > actor.x - range && t.x < actor.x + range && t.y > actor.y - v0 - range && t.y < actor.y - v0 + range)) ||
                    (gridType === 2 && (t.y > actor.y - range && t.y < actor.y + range && t.x > actor.x - v0 - range && t.x < actor.x - v0 + range)) ||
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

    Hooks.on("ready", function() {
        Hooks.on("updateToken", (scene, actorData) => {
            hookOnUpdateToken(scene, actorData);
        });

        const tableNames = game.settings.get("Hex-Assist", "tables").split(",");
        let missingTables = [];
        tableNames.forEach(name => {
            let table = game.tables.entities.find(t => t.name === name);
            if (!table) {
                missingTables.push(name);
            }
        });
        if (missingTables.length > 0) {
            ui.notifications.error("Please configure table names in settings or rename your tables and reload the world.", {permanent: true});
            ui.notifications.error("Your world is missing the following tables for Hex Assist: " + missingTables.join(", "), {permanent: true});
        }
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
        game.settings.register("Hex-Assist", "navigator", {
            name: "Default Navigator Name",
            hint: "Name of the actor that Hex Assist should look for if no token is selected.",
            scope: "world",
            config: true,
            default: "",
            type: String
        });
        game.settings.register("Hex-Assist", "day", {
            name: "Advance Day",
            hint: "Advance to the next day when using the Hex Crawl Macro.",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register("Hex-Assist", "journal", {
            name: "Create Journal Entry",
            hint: "Create/update Encounters journal entry instead of outputting to chat.",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register("Hex-Assist", "journalName", {
            name: "Journal Entry Name",
            hint: "Name of the Journal Entry to use for output.",
            scope: "world",
            config: true,
            default: "Encounters",
            type: String
        });
        game.settings.register("Hex-Assist", "direction", {
            name: "Marker Token Name",
            hint: "Name of the Map marker token to use for direction.",
            scope: "world",
            config: true,
            default: "Direction Marker",
            type: String
        });
        game.settings.register("Hex-Assist", "tables", {
            name: "Encounter Table names (csv)",
            hint: "Comma Separated list of tables to use for your adventure.",
            scope: "world",
            config: true,
            default: "Coast,Jungle: No Undead,Jungle: Lesser Undead,Jungle: Greater Undead,Mountains,River,Ruins,Swamp,Wasteland",
            type: String
        });
        game.settings.register("Hex-Assist", "weather", {
            name: "Weather Table Name",
            hint: "Name of table Hex Assist macro should use for weather. Will use standard weather if none found",
            scope: "world",
            config: true,
            default: "Weather",
            type: String
        });
    });
})();