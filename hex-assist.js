const HexAssist = (() => {
    // VERSION INFORMATION
    const HexAssist_Author = "Reaver01";
    const HexAssist_Version = "0.0.1";

    // FUNCTIONS
    // Handles Token Movement.
    const hookOnUpdateToken = function (scene, actorData, update) {

        if (!game.user.isGM || actorData.name != "Player Location") {
            return;
        }

        const gridSize = canvas.grid.size;
        const vertical = gridSize * 0.866666;
        const diagVertical = gridSize * 0.433333;
        const diagHorizontal = gridSize * 0.75;
        const searchSize = gridSize / 2;

        let tiles = [
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x - searchSize && tile.x < actorData.x + searchSize && tile.y > actorData.y - searchSize && tile.y < actorData.y + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x - searchSize && tile.x < actorData.x + searchSize && tile.y > actorData.y + vertical - searchSize && tile.y < actorData.y + vertical + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x - diagHorizontal - searchSize && tile.x < actorData.x - diagHorizontal + searchSize && tile.y > actorData.y + diagVertical - searchSize && tile.y < actorData.y + diagVertical + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x + diagHorizontal - searchSize && tile.x < actorData.x + diagHorizontal + searchSize && tile.y > actorData.y + diagVertical - searchSize && tile.y < actorData.y + diagVertical + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x - searchSize && tile.x < actorData.x + searchSize && tile.y > actorData.y - vertical - searchSize && tile.y < actorData.y - vertical + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x - diagHorizontal - searchSize && tile.x < actorData.x - diagHorizontal + searchSize && tile.y > actorData.y - diagVertical - searchSize && tile.y < actorData.y - diagVertical + searchSize),
            canvas.scene.data.tiles.find(tile => tile.img.indexOf("tile.png") > -1 && tile.x > actorData.x + diagHorizontal - searchSize && tile.x < actorData.x + diagHorizontal + searchSize && tile.y > actorData.y - diagVertical - searchSize && tile.y < actorData.y - diagVertical + searchSize),
        ];

        tiles = tiles.filter(tile => tile != undefined);

        if (tiles.length === 0) {
            return;
        }

        tiles.forEach(tile => {
            canvas.tiles.get(tile._id).update({
                hidden: true
            });
        });

    };

    // HOOKS
    Hooks.on("ready", function () {
        Hooks.on("updateToken", (scene, actorData, update) => {
            hookOnUpdateToken(scene, actorData, update);
        });
    });
})();