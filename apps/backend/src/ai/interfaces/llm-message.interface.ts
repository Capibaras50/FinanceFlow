export interface TextContentPart {
  type: 'text';
  text: string;
}

export interface ImageContentPart {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type UserContentPart = TextContentPart | ImageContentPart;

export interface SystemChatMessage {
  role: 'system';
  content: string;
}

export interface UserChatMessage {
  role: 'user';
  content: string | UserContentPart[];
}

export interface FunctionToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AssistantChatMessage {
  role: 'assistant';
  content: string | null;
  tool_calls?: FunctionToolCall[];
  reasoning_content?: string | null;
}

export interface ToolChatMessage {
  role: 'tool';
  tool_call_id: string;
  content: string;
}

export type ChatMessage =
  SystemChatMessage | UserChatMessage | AssistantChatMessage | ToolChatMessage;

export type ChatCompletionFinishReason =
  'stop' | 'tool_calls' | 'length' | 'content_filter' | 'function_call' | null;

export interface ChatCompletionChoice {
  finish_reason: ChatCompletionFinishReason;
  message: AssistantChatMessage;
}

export interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
}

export interface ChatCompletionToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: unknown;
  };
}

export interface ChatCompletionRequestBody {
  model: string;
  messages: ChatMessage[];
  tools?: ChatCompletionToolDefinition[];
  tool_choice?: 'auto' | 'none' | 'required';
  temperature?: number;
}

export interface ChatWithToolsResult {
  data: ChatCompletionResponse;
  messages: ChatMessage[];
}
