# Hex-Assist
Foundry VTT Module to help make your Hex Crawl more enjoyable. (Currently only supports Hexagonal Columns grid type)

# Macros
Included in Hex-Assist are 2 Macros. One to run your hex crawl adventure, and one to make any invisible hex tiles visible again!

# Setup
Hex-Assist requires some things on your part.
- Marker Tokens: A token named Player Location for the players to see their location, and a GM token (hidden) named Actual Location. The token names are configurable in settings now!
- Hex Tiles: You will need to make sure the Fog of War tile you use has the same name for every Fog of War tile. For now this does not support multiple tiles. You can configure the name in the settings.
- Rollable Tables: The macro uses various rollable tables for morning/afternoon/evening events. I would include these, but the ones I have are straight out of ToA and I can't distribute them.
- Table names: coast, jungle1, jungle2, jungle3, mountains, rivers, ruins, swamp, wasteland, cache, treasure, weather, deadexplorers
The names are pretty self explanitory.

# Use
- Once you've got everything setup, you need to select your navigator (the one that will be making a blind survival check, I reccomend keeping all the player tokens on the map in the GM layer for easy selection) and press the Hex Crawler macro.
- From here, you will pick the Hex type they are currently on, Ask the players what direction, if they are near a river and have a canoe ask them if they are using a canoe, and if they are going at a slow, average, or fast pace.
- After detirmining those things, press the pace, and it's off to exploring!
- In the chat you will see: Weather, notes on pace, How far the party moved, if they are lost (no message if they aren't), and morning/afternoon/evening encounters listed out.
- Repeat until you kill your party!

# Changelog
(0.0.2)
- Hex-Assist now has settings! You can configure the token and tile names to match what you want, instead of what I want!
- Made hiding and showing tiles use updateEmbeddedEntitiy so we can hide/show tiles all at once.
- Added a folder for Macros so changes can be seen. These will also be included in a compendium.
- Macros use Hex-Assist settings. Unfortunately this means you can't use the macros by themselves, but it'll keep everything more consistent.

# Future Plans
- Support for Hexagonal Rows