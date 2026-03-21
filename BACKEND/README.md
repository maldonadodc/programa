# ASHBOUND Backend

Simple FastAPI backend structure for the game ASHBOUND.

This version includes simple in-memory game logic for:
- player progression (`health`, `remanent`, `reputation`)
- demon definitions with nested combat stats
- turn-based combat with `attack`, `defend`, and `ability`
- rule-based demon AI with personality and health-based decisions
- zone entry that triggers combat encounters
- frontend-friendly JSON responses and CORS enabled

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Available Endpoints

- `POST /player/login`
- `GET /player/{id}`
- `GET /demons`
- `GET /demons/{id}`
- `GET /map/zones`
- `POST /map/zones/{zone_id}/enter`
- `POST /combat/start`
- `POST /combat/action`
