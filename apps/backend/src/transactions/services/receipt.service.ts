import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { CategoriesService } from 'src/categories/services/categories.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    private cloudinaryService: CloudinaryService,
    private walletService: WalletsService,
    private categoriesService: CategoriesService,
    @InjectQueue('receipt.expense.created')
    private queue: Queue,
  ) {}

  async findOne(id: number, profileId: number) {
    const receipt = await this.receiptRepository.findOne({
      where: {
        profile: { id: profileId },
        id,
      },
    });
    if (!receipt) {
      throw new NotFoundException('The Receipt Not Found');
    }
    return receipt;
  }

  async findAll(profileId: number, page?: number, take?: number) {
    const receipts = await this.receiptRepository.find({
      where: {
        profile: { id: profileId },
      },
      take: take || 10,
      skip: ((page ?? 1) - 1) * 10,
      order: {
        createdAt: 'DESC',
      },
    });
    return receipts;
  }

  async create(receiptUrl: string, profileId: number) {
    try {
      const wallets = await this.walletService.findAll(profileId);
      const categories = await this.categoriesService.findAll(profileId);
      const systemPrompt = `Eres un asistente experto en extracción de datos de recibos y facturas. Analiza la imagen y extrae ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional ni formato markdown:
      {
        "isReceipt": "true o false dependiendo si es un recibo o no",
        "fileName": "nombre del comercio junto con la fecha del dia",
        "name": "nombre del comercio o establecimiento",
        "value": monto_total_numerico,
        "description": "descripción de los items o servicios",
        "extractionConfidence": porcentaje_de_confianza_0_100,
        "walletName": "posible nombre del bolsillo al que se agregara el gasto los principales bolsillos son los siguientes: ${wallets.map((wallet) => wallet.name).join(', ')}",
        "categoryName": "posible nombre de la categoria a la que pertenece el gasto las principales categorias son las siguientes: ${categories.map((category) => category.name).join(', ')}"
      }`;

      const userMessage = 'Extrae la informacion del siguiente recibo';
      const { mimeType, base64, sizeBytes } =
        await this.cloudinaryService.getFileAsBase64(receiptUrl);
      await this.queue.add(
        'create-receipt',
        {
          profileId,
          sizeBytes,
          mimeType,
          receiptUrl,
          systemPrompt,
          base64,
          userMessage,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnFail: false,
          removeOnComplete: true,
        },
      );

      return { message: 'Start to process the Receipt' };
    } catch (err) {
      console.error(err);
      throw new BadRequestException('The receipt dont could be created');
    }
  }

  async remove(id: number, profileId: number) {
    const receipt = await this.findOne(id, profileId);
    await this.receiptRepository.delete({
      id: receipt.id,
      profile: { id: profileId },
    });
    return { id: receipt.id };
  }
}
