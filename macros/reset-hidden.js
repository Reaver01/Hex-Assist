const activeScene = game.scenes.active;
const sceneTiles = canvas.scene.data.tiles.reduce((updates, t) => {

    if (t.img.indexOf(game.settings.get("Hex-Assist", "tileName")) > -1 && t.hidden === true) {
        updates.push({
            _id: t._id,
            "hidden": false,
        });
        return updates;
    } else {
        return updates;
    }
}, []);
const updates = sceneTiles;
activeScene.updateEmbeddedEntity("Tile", updates);