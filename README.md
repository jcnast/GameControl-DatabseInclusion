There are two projects in this repo that I plan on combining in the long term, or at least the basics of each.

The first was a small attempt at having a character with abilities (auto-attacking, ranged AOE ability and a local AOE ability
that all do damage to any enemies that are hit.
There is also an AI component (the enemy) that will follow you if you are close enough, and attack you if you get within range.

The second is the main project that this has turned in to, which is including a database into a Unity 3D game.
The database is of my own construction and contains a bunch of characters, they opinions that they hold, and their relationships
with the other characters according to their opinions. Every second, 10 random interactions go off per character and so 
their relationships progress randomly.
The code is not terribly well optimized, as each character is trying to access the database and so things get a little congested but it is functional (in the RPG format, there would be less hits on the database at a time and would require character driven interactions for change, or for a drastic loading screen to intereact the other characters with each other - a la Shadow of Mordor). The one update that I am working on is having the character's opinions evolve as they interact more with.
the other characters and so they will change their opinions according to what their friends and enemies are doing.

These two projects are were also a testing ground for animation, particles, and using more of the Unity 3D API.

The database portion I am particularily proud of, as it was based on the web version called 'village tension' (also provided as a repo).

***********************

To mess around with the character abilites:

There are supplied documents for windows, mac and linux (only the windows has been tested currently)

w-a-s-d to move

q and mouse-location for ranged AOE attack

e for local AOE attack

left-click to attack (has a very small attack range)

you will need both the Abilities_ [your_ os_ here] file and the Abilities_ [your_ os_ here]_Data folder in the same location to play the game.

*run in windows mode as there is no UI for exiting or anything

***********************

To simulate a 10 person village based on random interactions:

There are supplied documents for windows, mac and linux (only the windows has been tested currently)

you will need both the Database_ [your_ os_ here] file and the Database_ [your_ os_ here]_Data folder in the same location to play the game.

Open the app and run in, it will take some time for anything to happen as it is currently set up for the database to be
re-made on the first run, and so everything must be created and enough interactions must be run for movement to begin.

*Characters move towards their allies and away from their enemies.

**********************
Please ask if you are interested in using my interaction system
