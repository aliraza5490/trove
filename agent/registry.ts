import { BaseAgent } from './base';
import { ChatAgent } from './chat-agent';

class AgentRegistry {
  private agents = new Map<string, BaseAgent>();

  constructor() {
    // Register default agents
    this.register(new ChatAgent());
  }

  register(agent: BaseAgent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): BaseAgent {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent with ID "${id}" not found.`);
    }
    return agent;
  }

  listAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}

export const agentRegistry = new AgentRegistry();
