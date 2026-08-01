import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from '../entities/contact.entity';
import { Repository } from 'typeorm';
import { ContactStatus } from '../enums/contact-status.enum';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}

  async findOrCreate(requesterId: number, addresseeId: number) {
    if (requesterId === addresseeId) {
      throw new BadRequestException(
        'Cannot send a contact request to yourself',
      );
    }

    const existing = await this.contactsRepository.findOne({
      where: [
        {
          requester: { id: requesterId },
          addressee: { id: addresseeId },
        },
        {
          requester: { id: addresseeId },
          addressee: { id: requesterId },
        },
      ],
    });

    if (existing) {
      if (
        existing.status === ContactStatus.PENDING &&
        existing.addressee.id === requesterId
      ) {
        existing.status = ContactStatus.ACCEPTED;
        return this.contactsRepository.save(existing);
      }
      throw new BadRequestException('A relationship already exists');
    }

    const contact = this.contactsRepository.create({
      requester: { id: requesterId },
      addressee: { id: addresseeId },
    });
    return this.contactsRepository.save(contact);
  }

  async findAll(profileId: number, take?: number, page?: number) {
    return this.contactsRepository.find({
      where: [
        {
          requester: { id: profileId },
          status: ContactStatus.ACCEPTED,
        },
        {
          addressee: { id: profileId },
          status: ContactStatus.ACCEPTED,
        },
      ],
      relations: ['requester', 'addressee'],
      take: take || 10,
      skip: ((page ?? 1) - 1) * (take || 10),
    });
  }

  async findOne(profileId: number, contactId: number) {
    const contact = await this.contactsRepository.findOne({
      where: [
        { id: contactId, requester: { id: profileId } },
        { id: contactId, addressee: { id: profileId } },
      ],
      relations: ['requester', 'addressee'],
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async findPendingSent(profileId: number, take?: number, page?: number) {
    return this.contactsRepository.find({
      where: {
        requester: { id: profileId },
        status: ContactStatus.PENDING,
      },
      relations: ['requester', 'addressee'],
      take: take || 10,
      skip: ((page ?? 1) - 1) * (take || 10),
    });
  }

  async findPendingReceived(profileId: number, take?: number, page?: number) {
    return this.contactsRepository.find({
      where: {
        addressee: { id: profileId },
        status: ContactStatus.PENDING,
      },
      relations: ['requester', 'addressee'],
      take: take || 10,
      skip: ((page ?? 1) - 1) * (take || 10),
    });
  }

  async updateStatus(
    profileId: number,
    contactId: number,
    status: ContactStatus,
  ) {
    const contact = await this.contactsRepository.findOne({
      where: { id: contactId, addressee: { id: profileId } },
    });
    if (!contact) {
      throw new NotFoundException('Contact request not found');
    }
    if (contact.status !== ContactStatus.PENDING) {
      throw new BadRequestException('Contact request is not pending');
    }
    contact.status = status;
    return this.contactsRepository.save(contact);
  }

  async remove(profileId: number, contactId: number) {
    const contact = await this.findOne(profileId, contactId);
    await this.contactsRepository.remove(contact);
  }
}
