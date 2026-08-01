import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from '../services/contacts.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { SendRequestDto } from '../dto/send-request.dto';
import { ContactStatus } from '../enums/contact-status.enum';

@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  sendRequest(
    @GetUser('profileId') profileId: number,
    @Body() dto: SendRequestDto,
  ) {
    return this.contactsService.findOrCreate(profileId, dto.addresseeId);
  }

  @Patch(':id/accept')
  accept(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.updateStatus(
      profileId,
      contactId,
      ContactStatus.ACCEPTED,
    );
  }

  @Patch(':id/reject')
  reject(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.updateStatus(
      profileId,
      contactId,
      ContactStatus.REJECTED,
    );
  }

  @Get()
  findAll(@GetUser('profileId') profileId: number) {
    return this.contactsService.findAll(profileId);
  }

  @Get('pending/sent')
  pendingSent(@GetUser('profileId') profileId: number) {
    return this.contactsService.findPendingSent(profileId);
  }

  @Get('pending/received')
  pendingReceived(@GetUser('profileId') profileId: number) {
    return this.contactsService.findPendingReceived(profileId);
  }

  @Get('pending/received/count')
  pendingReceivedCount(@GetUser('profileId') profileId: number) {
    return this.contactsService.countPendingReceived(profileId);
  }

  @Get(':id')
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.findOne(profileId, contactId);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.remove(profileId, contactId);
  }
}
