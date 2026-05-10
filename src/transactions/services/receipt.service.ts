import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { AiService } from 'src/ai/services/ai.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    private cloudinaryService: CloudinaryService,
    private aiService: AiService,
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

  async findAll(profileId: number) {
    const receipts = await this.receiptRepository.find({
      where: {
        profile: { id: profileId },
      },
    });
    return receipts;
  }

  async create(receiptUrl: string, createReceiptDto: CreateReceiptDto) {
    try {
      const systemPrompt = `Eres un asistente experto en extracción de datos de recibos y facturas. Analiza la imagen y extrae ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional ni formato markdown:
      {
        "name": "nombre del comercio o establecimiento",
        "value": monto_total_numerico,
        "description": "descripción de los items o servicios",
        "extractionConfidence": porcentaje_de_confianza_0_100
      }`;

      const userMessage = 'Extrae la informacion del siguiente recibo';
      const { mimeType, base64 } =
        await this.cloudinaryService.getFileAsBase64(receiptUrl);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const extractedData = await this.aiService.extractDataReceipt(
        base64,
        systemPrompt,
        mimeType,
        userMessage,
      );
      const newReceipt = {
        ...createReceiptDto,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        extractionConfidence: extractedData.extractionConfidence,
      };
      const createdReceipt = this.receiptRepository.create(newReceipt);
      return await this.receiptRepository.save(createdReceipt);
    } catch {
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
