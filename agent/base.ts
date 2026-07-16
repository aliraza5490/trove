import { AgentInput } from './types';

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract run(input: AgentInput): Promise<void>;
}
