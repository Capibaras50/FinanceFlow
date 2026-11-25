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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Contact } from '../entities/contact.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @HttpCode(201)
  @Post()
  @ApiBody({ type: SendRequestDto })
  @ApiCreatedResponse({
    description: 'Sent friend request to other user',
    type: Contact,
  })
  @ApiBadRequestResponse({
    description: 'Error the contact is your friend or you sent request to you',
  })
  sendRequest(
    @GetUser('profileId') profileId: number,
    @Body() dto: SendRequestDto,
  ) {
    return this.contactsService.findOrCreate(profileId, dto.addresseeId);
  }

  @Patch(':id/accept')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'The user accept the pending request',
    type: Contact,
  })
  @ApiNotFoundResponse({
    description: 'The request not exist',
  })
  @ApiBadRequestResponse({
    description: 'The request is not pending',
  })
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
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'The user reject the pending request',
    type: Contact,
  })
  @ApiNotFoundResponse({
    description: 'The request not exist',
  })
  @ApiBadRequestResponse({
    description: 'The request is not pending',
  })
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
  @ApiOkResponse({
    description: 'Return all contacts of user',
    type: [Contact],
  })
  findAll(@GetUser('profileId') profileId: number) {
    return this.contactsService.findAll(profileId);
  }

  @Get('pending/sent')
  @ApiOkResponse({
    description: 'Return all requests with status pending that user sent',
    type: [Contact],
  })
  pendingSent(@GetUser('profileId') profileId: number) {
    return this.contactsService.findPendingSent(profileId);
  }

  @Get('pending/received')
  @ApiOkResponse({
    description: 'Return all requests with status pending that user received',
    type: [Contact],
  })
  pendingReceived(@GetUser('profileId') profileId: number) {
    return this.contactsService.findPendingReceived(profileId);
  }

  @Get('pending/received/count')
  @ApiOkResponse({
    description:
      'Return the number of requests with status pending that user received',
    type: [Contact],
  })
  pendingReceivedCount(@GetUser('profileId') profileId: number) {
    return this.contactsService.countPendingReceived(profileId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'Return one contact of user',
    type: Contact,
  })
  @ApiNotFoundResponse({
    description: 'The contact not exists',
  })
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.findOne(profileId, contactId);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({
    description: 'Delete some contact of user',
  })
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.remove(profileId, contactId);
  }
}
