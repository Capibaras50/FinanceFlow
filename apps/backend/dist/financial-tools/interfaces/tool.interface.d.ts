export interface ToolProperty {
    type: string;
    description?: string;
    enum?: string[];
    items?: ToolProperty;
}
export interface ToolParameters {
    type: 'object';
    properties: Record<string, ToolProperty>;
    required: string[];
}
export interface Tool<TArguments = void, TResult = unknown> {
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: TArguments): Promise<TResult>;
}
