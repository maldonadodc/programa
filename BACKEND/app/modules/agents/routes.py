from fastapi import APIRouter

from app.modules.agents.models import AgentActionRequest, AgentActionResponse, AgentResponse
from app.modules.agents.service import execute_action, get_agent, list_agents


router = APIRouter()


@router.get("", response_model=list[AgentResponse])
def read_agents() -> list[dict]:
    return list_agents()


@router.get("/{agent_id}", response_model=AgentResponse)
def read_agent(agent_id: int) -> dict:
    return get_agent(agent_id)


@router.post("/{agent_id}/action", response_model=AgentActionResponse)
def trigger_agent_action(agent_id: int, payload: AgentActionRequest) -> dict:
    return execute_action(agent_id, payload.player_id, payload.state)
