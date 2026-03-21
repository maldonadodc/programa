from __future__ import annotations

import random


DEMON_ACTIONS = ("attack", "defend", "ability")


def get_next_demon_action(demon: dict) -> str:
    demon_type = demon.get("type", "shadow")
    current_health = demon.get("stats", {}).get("hp", 0)
    max_health = demon.get("max_health", current_health or 1)
    health_ratio = current_health / max_health if max_health else 0

    if demon_type == "shadow":
        return _choose_shadow_action(health_ratio)

    if health_ratio > 0.5:
        return _choose_high_health_action(demon_type)

    if health_ratio < 0.3:
        return _choose_low_health_action(demon_type)

    return _choose_mid_health_action(demon_type)


def _choose_high_health_action(demon_type: str) -> str:
    if demon_type == "fire":
        return _weighted_choice(("attack", "attack", "attack", "ability", "defend"))
    if demon_type == "abyss":
        return _weighted_choice(("attack", "attack", "defend", "defend", "ability"))
    return _weighted_choice(DEMON_ACTIONS)


def _choose_low_health_action(demon_type: str) -> str:
    if demon_type == "fire":
        return _weighted_choice(("ability", "ability", "attack", "defend"))
    if demon_type == "abyss":
        return _weighted_choice(("defend", "defend", "ability", "attack"))
    return _weighted_choice(DEMON_ACTIONS)


def _choose_mid_health_action(demon_type: str) -> str:
    if demon_type == "fire":
        return _weighted_choice(("attack", "attack", "ability", "defend"))
    if demon_type == "abyss":
        return _weighted_choice(("defend", "attack", "defend", "ability"))
    return _weighted_choice(DEMON_ACTIONS)


def _choose_shadow_action(health_ratio: float) -> str:
    if health_ratio < 0.3:
        return _weighted_choice(("attack", "defend", "ability", "ability"))
    return _weighted_choice(DEMON_ACTIONS)


def _weighted_choice(options: tuple[str, ...]) -> str:
    return random.choice(options)
