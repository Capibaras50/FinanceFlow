export interface AssistantMessageInterface {
  role: 'assistant';
  content: string;
  reasoning_content: string;
  tool_calls: string[];
}
