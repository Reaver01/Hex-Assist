const navigatorName = game.settings.get("Hex-Assist", "navigator");
let defaultNavigator;

if (canvas.tokens.controlled.length === 0 && !navigatorName) {
    return ui.notifications.error("Please select the token of the Navigator!");
} else if (navigatorName) {
    defaultNavigator = game.actors.entities.find(a => a.data.name === navigatorName);
    if (!defaultNavigator) {
        return ui.notifications.error("Please select the token of the Navigator!");
    }
}

const currentScene = canvas.scene;
const gridType = currentScene.data.gridType;

if (gridType !== 4 && gridType !== 2) {
    return ui.notifications.error("The current grid is not a Hex Grid!");
}

const playerMarker = currentScene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "tokenName"));
const locationMarker = currentScene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "actualName"));
const directionMarker = currentScene.data.tokens.find(a => a.name === game.settings.get("Hex-Assist", "direction"));

let pX = playerMarker.x;
let pY = playerMarker.y;
let lX = locationMarker.x;
let lY = locationMarker.y;
let dX = (directionMarker) ? directionMarker.x : 0;
let dY = (directionMarker) ? directionMarker.y : 0;

const gridSize = canvas.grid.size;

const vertical = gridSize * 0.866666;
const horizontal = gridSize * 0.866666;
let diagVertical = gridSize * 0.433333;
let diagHorizontal = gridSize * 0.75;

if (gridType === 2) {
    diagVertical = gridSize * 0.75;
    diagHorizontal = gridSize * 0.433333;
}

const range = gridSize / 10;
let updates = [];

let formContent = `<form><div class="form-group"><label>Hex Type:</label><select id="hex-type" name="hex-type">`;
const tableNames = game.settings.get("Hex-Assist", "tables").split(",");
tableNames.forEach(name => {
    formContent += `<option value="` + name + `">` + name + `</option>`;
});
formContent += `</select></div><div class="form-group"><label>Travel Direction:</label><select id="travel-direction" name="travel-direction">
`;
if (directionMarker) {
    formContent += `<option value="Marker">Marker</option>`;
}
if (gridType === 2) {
    formContent += `<option value="East">East</option>`;
}
if (gridType === 4) {
    formContent += `<option value="North">North</option>`;
}
formContent += `<option value="Northeast">Northeast</option><option value="Northwest">Northwest</option>`;
if (gridType === 4) {
    formContent += `<option value="North">South</option>`;
}
formContent += `<option value="Southeast">Southeast</option><option value="Southwest">Southwest</option>`;

if (gridType === 2) {
    formContent += `<option value="West">West</option>`;
}
formContent += `</select></div><div class="form-group"><label>Travel Type:</label><select id="travel-type" name="travel-type"><option value="on-foot">On Foot</option><option value="canoe">By Canoe</option></select></div></form>`;

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
                if (gridType === 2) {
                    playerDirection = ["Northeast", "Northwest"][Math.floor(Math.random() * 2)];
                }
                if (gridType === 4) {
                    playerDirection = "North";
                }
            } else if (dY > pY && (dX === pX || (dX > pX - range && dX < pX + range))) {
                if (gridType === 2) {
                    playerDirection = ["Southeast", "Southwest"][Math.floor(Math.random() * 2)];
                }
                if (gridType === 4) {
                    playerDirection = "South";
                }
            } else if (dX < pX && (dX === pX || (dY > pY - range && dY < pY + range))) {
                if (gridType === 2) {
                    playerDirection = "West";
                }
                if (gridType === 4) {
                    playerDirection = ["Northwest", "Southwest"][Math.floor(Math.random() * 2)];
                }
            } else if (dX > pX && (dX === pX || (dY > pY - range && dY < pY + range))) {
                if (gridType === 2) {
                    playerDirection = "East";
                }
                if (gridType === 4) {
                    playerDirection = ["Northeast", "Southeast"][Math.floor(Math.random() * 2)];
                }
            } else if (dX < pX && dY < pY) {
                playerDirection = "Northwest";
            } else if (dX > pX && dY < pY) {
                playerDirection = "Northeast";
            } else if (dX < pX && dY > pY) {
                playerDirection = "Southwest";
            } else if (dX > pX && dY > pY) {
                playerDirection = "Southeast";
            }
        }
        let directions = ["North", "Northeast", "Northwest", "South", "Southeast", "Southwest"];
        if (gridType === 2) {
            directions = ["West", "Northeast", "Northwest", "East", "Southeast", "Southwest"];
        }
        const encounterTable = game.tables.entities.find(t => t.name === hexType);
        const weatherTable = game.tables.entities.find(t => t.name === game.settings.get("Hex-Assist", "weather"));
        let weatherRoll = "";
        if (weatherTable) {
            weatherRoll = weatherTable.roll().results[0].text;
        } else {
            weatherRoll = ["Light Rain", "Heavy Rain", "Tropical Storm"][Math.floor(Math.random() * 3)]
        }
        let lostDirection = directions[Math.floor(Math.random() * directions.length)];
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
                switch (lostDirection) {
                    case 'South':
                        lX = locationMarker.x;
                        lY = locationMarker.y + (vertical * hexesMoved);
                        break;

                    case 'Southwest':
                        lX = locationMarker.x - (diagHorizontal * hexesMoved);
                        lY = locationMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'Southeast':
                        lX = locationMarker.x + (diagHorizontal * hexesMoved);
                        lY = locationMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'North':
                        lX = locationMarker.x;
                        lY = locationMarker.y - (vertical * hexesMoved);
                        break;

                    case 'Northwest':
                        lX = locationMarker.x - (diagHorizontal * hexesMoved);
                        lY = locationMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'Northeast':
                        lX = locationMarker.x + (diagHorizontal * hexesMoved);
                        lY = locationMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'East':
                        lX = locationMarker.x + (horizontal * hexesMoved);
                        lY = locationMarker.y;
                        break;

                    case 'West':
                        lX = locationMarker.x - (horizontal * hexesMoved);
                        lY = locationMarker.y;
                        break;

                    default:
                        break;
                }
            }
            if (playerMarker) {
                switch (playerDirection) {
                    case 'South':
                        pX = playerMarker.x;
                        pY = playerMarker.y + (vertical * hexesMoved);
                        break;

                    case 'Southwest':
                        pX = playerMarker.x - (diagHorizontal * hexesMoved);
                        pY = playerMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'Southeast':
                        pX = playerMarker.x + (diagHorizontal * hexesMoved);
                        pY = playerMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'North':
                        pX = playerMarker.x;
                        pY = playerMarker.y - (vertical * hexesMoved);
                        break;

                    case 'Northwest':
                        pX = playerMarker.x - (diagHorizontal * hexesMoved);
                        pY = playerMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'Northeast':
                        pX = playerMarker.x + (diagHorizontal * hexesMoved);
                        pY = playerMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'East':
                        pX = playerMarker.x + (horizontal * hexesMoved);
                        pY = playerMarker.y;
                        break;

                    case 'West':
                        pX = playerMarker.x - (horizontal * hexesMoved);
                        pY = playerMarker.y;
                        break;

                    default:
                        break;
                }
            }
        } else {
            if (playerMarker && locationMarker) {

                switch (playerDirection) {
                    case 'South':
                        pX = lX = locationMarker.x;
                        pY = lY = locationMarker.y + (vertical * hexesMoved);
                        break;

                    case 'Southwest':
                        pX = lX = locationMarker.x - (diagHorizontal * hexesMoved);
                        pY = lY = locationMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'Southeast':
                        pX = lX = locationMarker.x + (diagHorizontal * hexesMoved);
                        pY = lY = locationMarker.y + (diagVertical * hexesMoved);
                        break;

                    case 'North':
                        pX = lX = locationMarker.x;
                        pY = lY = locationMarker.y - (vertical * hexesMoved);
                        break;

                    case 'Northwest':
                        pX = lX = locationMarker.x - (diagHorizontal * hexesMoved);
                        pY = lY = locationMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'Northeast':
                        pX = lX = locationMarker.x + (diagHorizontal * hexesMoved);
                        pY = lY = locationMarker.y - (diagVertical * hexesMoved);
                        break;

                    case 'East':
                        pX = lX = locationMarker.x + (horizontal * hexesMoved);
                        pY = lY = locationMarker.y;
                        break;

                    case 'West':
                        pX = lX = locationMarker.x - (horizontal * hexesMoved);
                        pY = lY = locationMarker.y;
                        break;

                    default:
                        break;
                }
            }
        }

        if (playerMarker) {
            updates.push({
                _id: playerMarker._id,
                x: pX,
                y: pY
            });
        }

        if (locationMarker) {
            updates.push({
                _id: locationMarker._id,
                x: lX,
                y: lY
            });
        }

        if (updates.length > 0) {
            currentScene.updateEmbeddedEntity("Token", updates);
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