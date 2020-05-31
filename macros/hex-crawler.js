const navigatorName = game.settings.get("Hex-Assist", "navigator");
let defaultNavigator;
if (canvas.tokens.controlled.length === 0 && !navigatorName) {
    return ui.notifications.error("Please select the token of the Navigator!");
} else if (navigatorName) {
    console.log(navigatorName);
    defaultNavigator = game.actors.entities.find(a => a.data.name === navigatorName);
    if (!defaultNavigator) {
        return ui.notifications.error("Please select the token of the Navigator!");
    }
}

const playerMarker = canvas.scene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "tokenName"));
const locationMarker = canvas.scene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "actualName"));
const directionMarker = canvas.scene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "direction"));

const pX = playerMarker.x;
const pY = playerMarker.y;
const dX = directionMarker.x;
const dY = directionMarker.y;

const gridSize = canvas.grid.size;
const vertical = gridSize * 0.866666;
const diagVertical = gridSize * 0.433333;
const diagHorizontal = gridSize * 0.75;
const range = gridSize / 10;

let formContent = `
<form>
    <div class="form-group">
        <label>Hex Type:</label>
        <select id="hex-type" name="hex-type">
            <option value="coast">Coast</option>
            <option value="jungle1">Jungle: No Undead</option>
            <option value="jungle2">Jungle: Lesser Undead</option>
            <option value="jungle3">Jungle: Greater Undead</option>
            <option value="mountains">Mountains</option>
            <option value="rivers">River</option>
            <option value="ruins">Ruins</option>
            <option value="swamp">Swamp</option>
            <option value="wasteland">Wasteland</option>
        </select>
    </div>
    <div class="form-group">
        <label>Travel Direction:</label>
        <select id="travel-direction" name="travel-direction">
`;
if (directionMarker) {
    formContent += `<option value="Marker">Marker</option>`;
}
formContent += `
            <option value="North">North</option>
            <option value="Northeast">Northeast</option>
            <option value="Southeast">Southeast</option>
            <option value="South">South</option>
            <option value="Southwest">Southwest</option>
            <option value="Northwest">Northwest</option>
        </select>
    </div>
    <div class="form-group">
        <label>Travel Type:</label>
        <select id="travel-type" name="travel-type">
            <option value="on-foot">On Foot</option>
            <option value="canoe">By Canoe</option>
        </select>
    </div>
</form>
`;

let pace = 'none';
new Dialog({
    title: `Hex Crawl Helper`,
    content: formContent,
    buttons: {
        slow: {
            icon: "<i class='fas fa-user-ninja'></i>",
            label: `Slow Pace`,
            callback: () => pace = 'slow'
        },
        average: {
            icon: "<i class='fas fa-hiking'></i>",
            label: `Average Pace`,
            callback: () => pace = 'average'
        },
        fast: {
            icon: "<i class='fas fa-running'></i>",
            label: `Fast Pace`,
            callback: () => pace = 'fast'
        }
    },
    default: "average",
    close: html => {
        let hexType = html.find('[name="hex-type"]')[0].value;
        let travelType = html.find('[name="travel-type"]')[0].value;
        let playerDirection = html.find('[name="travel-direction"]')[0].value;
        if (playerDirection === "Marker") {
            if (dY < pY && (dX === pX || (dX > pX - range && dX < pX + range))) {
                playerDirection = "North";
            } else if (dY > pY && (dX === pX || (dX > pX - range && dX < pX + range))) {
                playerDirection = "South";
            } else if (dX < pX && dY < pY) {
                playerDirection = "Northwest";
            } else if (dX > pX && dY < pY) {
                playerDirection = "Northeast";
            } else if ((dX < pX && dY > pY) || (dX < pX && (dX === pX || (dY > pY - range && dY < pY + range)))) {
                playerDirection = "Southwest";
            } else if ((dX > pX && dY > pY) || (dX > pX && (dX === pX || (dY > pY - range && dY < pY + range)))) {
                playerDirection = "Southeast";
            }
        }
        const weatherTable = game.tables.entities.find(t => t.name === "weather");
        const directions = ["North", "Northeast", "Northwest", "South", "Southeast", "Southwest"];
        const encounterTable = game.tables.entities.find(t => t.name === hexType);
        let weatherRoll = weatherTable.roll().results[0].text;
        let lostDirection = directions[Math.floor(Math.random() * directions.length)];;
        let msgContent = '<strong>Weather</strong> ' + weatherRoll + '<br/><br/>';
        let navigator = defaultNavigator;
        if (!navigator) {
            navigator = Actors.instance.get(canvas.tokens.controlled[0].data.actorId);
        }
        if (!navigator) {
            return;
        }
        let wis = navigator.data.data.abilities.wis.mod;
        let survival = new Roll(`1d20`).roll().total + wis;
        let survival2 = new Roll(`1d20`).roll().total + wis;
        if (weatherRoll.indexOf('Tropical storm') > -1 && survival > survival2) {
            survival = survival2;
        }
        let slowPace = new Roll(`1d4`).roll().total;
        let fastPace = new Roll(`1d2`).roll().total;
        let hexesMoved = 1;
        let encounter = '';
        let hexText = 'hexes';

        if (travelType === 'canoe') {
            hexesMoved++;
        }

        if (pace === 'slow') {
            if (slowPace === 1)
                hexesMoved--;
            if (hexesMoved === 1)
                hexText = 'hex';
            msgContent += '<strong>Slow pace:</strong> Can hide from encounters or approach stealthily.<br/><br/><strong>Party can move:</strong> ' + hexesMoved + ' ' + hexText + '.<br/><br/>';
            survival += 5;
        } else if (pace === 'average') {
            if (hexesMoved === 1)
                hexText = 'hex';
            msgContent += '<strong>Average pace:</strong> For rivers, upstream and downstream have no effect, and waterfalls occur every 10 to 20 miles (requiring portage of canoes).<br/><br/><strong>Party can move:</strong> ' + hexesMoved + ' ' + hexText + '.<br/><br/>';
        } else if (pace === 'fast') {
            if (fastPace === 1)
                hexesMoved++;
            if (hexesMoved === 1)
                hexText = 'hex';
            msgContent += '<strong>Fast pace:</strong> -5 to passive Perception.<br/><br/><strong>Party can move:</strong> ' + hexesMoved + ' ' + hexText + '.<br/><br/>';
            survival -= 5;
        } else {
            return;
        }

        if (((hexType === 'coast' || hexType === 'ruins') && survival < 10) || ((hexType === 'jungle1' || hexType === 'jungle2' || hexType === 'jungle3' || hexType === 'mountains' || hexType === 'rivers' || hexType === 'swamp' || hexType === 'wasteland') && survival < 15)) {
            msgContent += '<strong>Party is Lost:</strong> Move actual location ' + hexesMoved + ' ' + hexText + ' to the ' + lostDirection + '<br/><br/>';
            if (locationMarker) {
                const locToken = canvas.tokens.get(locationMarker._id);
                switch (lostDirection) {
                    case 'South':
                        locToken.update({
                            x: locToken.x,
                            y: locToken.y + (vertical * hexesMoved)
                        });
                        break;

                    case 'Southwest':
                        locToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Southeast':
                        locToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'North':
                        locToken.update({
                            x: locToken.x,
                            y: locToken.y - (vertical * hexesMoved)
                        });
                        break;

                    case 'Northwest':
                        locToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Northeast':
                        locToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    default:
                        break;
                }
            }
            if (playerMarker) {
                const playerToken = canvas.tokens.get(playerMarker._id);
                switch (playerDirection) {
                    case 'South':
                        playerToken.update({
                            x: playerToken.x,
                            y: playerToken.y + (vertical * hexesMoved)
                        });
                        break;

                    case 'Southwest':
                        playerToken.update({
                            x: playerToken.x - (diagHorizontal * hexesMoved),
                            y: playerToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Southeast':
                        playerToken.update({
                            x: playerToken.x + (diagHorizontal * hexesMoved),
                            y: playerToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'North':
                        playerToken.update({
                            x: playerToken.x,
                            y: playerToken.y - (vertical * hexesMoved)
                        });
                        break;

                    case 'Northwest':
                        playerToken.update({
                            x: playerToken.x - (diagHorizontal * hexesMoved),
                            y: playerToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Northeast':
                        playerToken.update({
                            x: playerToken.x + (diagHorizontal * hexesMoved),
                            y: playerToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    default:
                        break;
                }
            }
        } else {
            if (playerMarker && locationMarker) {
                const locToken = canvas.tokens.get(locationMarker._id);
                const playerToken = canvas.tokens.get(playerMarker._id);

                switch (playerDirection) {
                    case 'South':
                        playerToken.update({
                            x: locToken.x,
                            y: locToken.y + (vertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x,
                            y: locToken.y + (vertical * hexesMoved)
                        });
                        break;

                    case 'Southwest':
                        playerToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Southeast':
                        playerToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y + (diagVertical * hexesMoved)
                        });
                        break;

                    case 'North':
                        playerToken.update({
                            x: locToken.x,
                            y: locToken.y - (vertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x,
                            y: locToken.y - (vertical * hexesMoved)
                        });
                        break;

                    case 'Northwest':
                        playerToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x - (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    case 'Northeast':
                        playerToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        locToken.update({
                            x: locToken.x + (diagHorizontal * hexesMoved),
                            y: locToken.y - (diagVertical * hexesMoved)
                        });
                        break;

                    default:
                        break;
                }
            }
        }

        msgContent += '<strong>Morning Encounter:</strong> ';

        if (new Roll(`1d20`).roll().total > 15) {
            encounter = encounterTable.roll().results[0].text;
            msgContent += encounter;
            msgContent += '<br/><br/><strong>Afternoon Encounter:</strong> ';
        } else {
            msgContent += 'None.<br/><br/><strong>Afternoon Encounter:</strong> ';
        }

        if (new Roll(`1d20`).roll().total > 15) {
            encounter = encounterTable.roll().results[0].text;
            msgContent += encounter;
            msgContent += '<br/><br/><strong>Evening Encounter:</strong> ';
        } else {
            msgContent += 'None.<br/><br/><strong>Evening Encounter:</strong> ';
        }

        if (new Roll(`1d20`).roll().total > 15) {
            encounter = encounterTable.roll().results[0].text;
            msgContent += encounter;
        } else {
            msgContent += 'None.';
        }

        if (game.settings.get("Hex-Assist", "journal")) {
            let journal = game.journal.entities.find(j => j.data.name === "Encounters");
            if (journal) {
                journal.update({
                    content: msgContent
                })
            } else {
                JournalEntry.create({
                    name: "Encounters",
                    content: msgContent
                });
                journal = game.journal.entities.find(j => j.data.name === "Encounters");
            }
            journal.show();
        } else {
            let chatData = {
                content: msgContent,
                whisper: game.users.entities.filter(u => u.isGM).map(u => u._id)
            };
            ChatMessage.create(chatData, {});
        }

        if (game.modules.get("calendar-weather") && game.settings.get("Hex-Assist", "day")) {
            game.Gametime.advanceTime({
                days: 1
            })
        }
    }
}).render(true);