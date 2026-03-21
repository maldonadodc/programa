from __future__ import annotations

from itertools import count


players: dict[int, dict] = {
    1: {
        "id": 1,
        "username": "hunter_zero",
        "level": 7,
        "health": 120,
        "max_health": 120,
        "attack": 18,
        "defense": 6,
        "remanent": 250,
        "reputation": 40,
    },
    2: {
        "id": 2,
        "username": "ember_scout",
        "level": 4,
        "health": 95,
        "max_health": 95,
        "attack": 12,
        "defense": 4,
        "remanent": 120,
        "reputation": 18,
    },
}

demons: dict[int, dict] = {
    1: {
        "id": 1,
        "name": "Cinder Hound",
        "type": "fire",
        "stats": {
            "hp": 60,
            "attack": 10,
            "defense": 3,
        },
        "zone_id": 1,
        "rewards": {
            "remanent": 20,
            "reputation": 5,
        },
    },
    2: {
        "id": 2,
        "name": "Ash Wraith",
        "type": "abyss",
        "stats": {
            "hp": 85,
            "attack": 14,
            "defense": 5,
        },
        "zone_id": 2,
        "rewards": {
            "remanent": 35,
            "reputation": 8,
        },
    },
    3: {
        "id": 3,
        "name": "Molten Behemoth",
        "type": "fire",
        "stats": {
            "hp": 140,
            "attack": 20,
            "defense": 8,
        },
        "zone_id": 3,
        "rewards": {
            "remanent": 60,
            "reputation": 15,
        },
    },
}

zones: list[dict] = [
    {
        "id": 1,
        "name": "Scorched Path",
        "danger_level": 1,
        "demon_ids": [1],
    },
    {
        "id": 2,
        "name": "Ember Hollow",
        "danger_level": 2,
        "demon_ids": [2],
    },
    {
        "id": 3,
        "name": "Obsidian Gate",
        "danger_level": 4,
        "demon_ids": [3],
    },
]

active_combats: dict[int, dict] = {}

player_id_sequence = count(start=max(players) + 1 if players else 1)
combat_id_sequence = count(start=1)
