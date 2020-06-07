# Hex-Assist
Foundry VTT Module to help make your Hex Crawl more enjoyable. (Currently only supports Hexagonal Columns grid type)

# Macros
Included in Hex-Assist are 2 Macros. One to run your hex crawl adventure, and one to make any invisible hex tiles visible again!
THESE WILL NEED TO BE IMPORTED FROM THE COMPENDIUM WITH EACH NEW RELEASE! Alternatively you can copy and paste the macro content yourself from the included .js files.

# Setup
Hex-Assist requires some things on your part.
- Marker Tokens: A token named Player Location for the players to see their location, a GM token (hidden) named Actual Location, and optionally a third player-controlled token named Direction Marker. The token names are configurable in settings.
- Hex Tiles: You will need to make sure the Fog of War tile you use has the same name for every Fog of War tile. For now, this does not support multiple tiles. You can configure the name in the settings.
- Rollable Tables: The macro uses various rollable tables for morning/afternoon/evening events. I would include these, but the ones I have are straight out of ToA and I can't distribute them.
- Configurable Encounter Table names: Coast,Jungle: No Undead, Jungle: Lesser Undead, Jungle: Greater Undead, Mountains, River, Ruins, Swamp, Wasteland
- Put Survival Check DC for the area in the Description Field. If nothing is put there, or it's not a number then 10 will be used.
- Optional and configurable Weather Table name: Weather

# Use
- Once you've got everything setup, you need to select your navigator (the one that will be making a blind survival check, I reccomend keeping all the player tokens on the map in the GM layer for easy selection) and press the Hex Crawler macro.
- From here, you will pick the Hex type they are currently on, Ask the players what direction (or have them move the direction marker token to their desired destination), if they are near a river and have a canoe ask them if they are using a canoe, and if they are going at a slow, average, or fast pace.
- After determining those things, press the pace, and it's off to exploring!
- In the chat you will see: Weather, notes on pace, how far the party moved, if they are lost (no message if they aren't), and morning/afternoon/evening encounters listed out.
- Repeat until you kill your party!