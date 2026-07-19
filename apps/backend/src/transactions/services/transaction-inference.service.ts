import { Injectable } from '@nestjs/common';
import { LlmService } from 'src/ai/services/llm.service';
import { CategoriesService } from 'src/categories/services/categories.service';
import { WalletsService } from 'src/wallets/services/wallets.service';

@Injectable()
export class TransactionInferenceService {
  constructor(
    private llmService: LlmService,
    private walletsService: WalletsService,
    private categoriesService: CategoriesService,
  ) {}

  async inferBestCategoryTransaction(
    profileId: number,
    nameTransaction: string,
  ): Promise<number> {
    const systemPrompt = `Eres un sistema de matching financiero. Tu tarea es seleccionar la categoría más adecuada de la lista proporcionada basándote en la descripción de una transacción.

Reglas:
- Devuelve ÚNICAMENTE el ID numérico de la categoría, sin texto adicional, sin formato, sin markdown, sin explicaciones.
- Si ninguna categoría coincide exactamente, elige la más cercana por contexto semántico.
- Si hay múltiples candidatos, elige el más relevante para la transacción.`;

    const categories = await this.categoriesService.findAll(profileId);
    const categoriesList = categories
      .map((category) => `${category.id}: ${category.name}`)
      .join('\n');

    const aiResponse = await this.llmService.createResponseModel(
      systemPrompt,
      `Categorías del usuario:\n${categoriesList}\n\nNombre de la transacción: "${nameTransaction}"\n\n¿Cuál es el ID de la categoría más adecuada? Responde solo con el número.`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const content: string = aiResponse.data.choices?.[0]?.message?.content;
    if (!content) {
      return categories[0]?.id;
    }

    const parsedId = Number(content.trim());
    return isNaN(parsedId) ? categories[0]?.id : parsedId;
  }

  async inferBestWalletTransaction(
    profileId: number,
    nameTransaction: string,
  ): Promise<number> {
    const systemPrompt = `Eres un sistema de matching financiero. Tu tarea es seleccionar la cartera (wallet) más adecuada de la lista proporcionada basándote en la descripción de una transacción.

Reglas:
- Devuelve ÚNICAMENTE el ID numérico de la cartera, sin texto adicional, sin formato, sin markdown, sin explicaciones.
- Si ninguna cartera coincide exactamente, elige la más cercana por contexto semántico.
- Si hay múltiples candidatos, elige el más relevante para la transacción.`;

    const wallets = await this.walletsService.findAll(profileId);
    const walletsList = wallets
      .map((wallet) => `${wallet.id}: ${wallet.name}`)
      .join('\n');

    const aiResponse = await this.llmService.createResponseModel(
      systemPrompt,
      `Carteras del usuario:\n${walletsList}\n\nNombre de la transacción: "${nameTransaction}"\n\n¿Cuál es el ID de la cartera más adecuada? Responde solo con el número.`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const content: string = aiResponse.data.choices?.[0]?.message?.content;
    if (!content) {
      return wallets[0]?.id;
    }

    const parsedId = Number(content.trim());
    return isNaN(parsedId) ? wallets[0]?.id : parsedId;
  }
}
