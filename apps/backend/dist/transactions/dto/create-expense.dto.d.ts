export declare class CreateExpenseDto {
    name: string;
    description: string;
    value: number;
    walletId: number;
    categoriesId: number[];
    receiptId?: number;
}
