export interface CreateReceiptInterface {
    profileId: number;
    sizeBytes: number;
    mimeType: string;
    receiptUrl: string;
    systemPrompt: string;
    base64: string;
    userMessage: string;
}
