There are two projects in this repo that I plan on combining in the long term, or at least the basics of each.

The first was a small attempt at having a character with abilities (auto-attacking, ranged AOE ability and a local AOE ability
that all do damage to any enemies that are hit.
There is also an AI component (the enemy) that will follow you if you are close enough, and attack you if you get within range.

The second is the main project that this has turned in to, which is including a database into a Unity 3D game.
The database is of my own construction and contains a bunch of characters, they opinions that they hold, and their relationships
with the other characters according to their opinions. Every second, 10 random interactions go off per character and so 
their relationships progress randomly.
The code is not terribly well optimized, as each character is trying to access the database and so things get a little congested
but it is functional. The one update that I am working on is having the character's opinions evolve as they interact more with
the other characters and so they will change their opinions according to what their friends and enemies are doing.

These two projects are were also a testing ground for animation, particles, and using more of the Unity 3D API.

The database portion I am particularily proud of, as it was based on the web version 
