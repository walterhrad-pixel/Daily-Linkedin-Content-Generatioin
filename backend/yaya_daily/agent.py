from google.adk.agents.sequential_agent import SequentialAgent

from .miner import miner_agent
from .ghostwriter import ghostwriter_agent
from .humanizer import humanizer_agent

root_agent = SequentialAgent(
    name="DailyContentOrchestrator",
    sub_agents=[miner_agent, ghostwriter_agent, humanizer_agent],
)
