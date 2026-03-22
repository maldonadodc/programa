from app.modules.agents.service import decide_action


def get_next_demon_action(demon: dict) -> str:
    state = {
        "hp": demon.get("stats", {}).get("hp", 0),
        "max_hp": demon.get("max_health", demon.get("stats", {}).get("hp", 1)),
    }
    return decide_action(state, demon)
