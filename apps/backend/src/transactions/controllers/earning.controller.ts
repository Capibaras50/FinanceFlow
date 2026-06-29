import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { EarningService } from '../services/earning.service';
import { CreateEarningDto } from '../dto/create-earning.dto';
import { UpdateEarningDto } from '../dto/update-earning.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('earnings')
export class EarningController {
  constructor(private earningService: EarningService) {}

  @Get()
  findAll(@GetUser('profileId') profileId: number) {
    return this.earningService.findAll(profileId);
  }

  @Get(':id')
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.findOne(id, profileId);
  }

  @Post()
  create(
    @GetUser('profileId') profileId: number,
    @Body() newEarning: CreateEarningDto,
  ) {
    return this.earningService.create(newEarning, profileId);
  }

  @Patch(':id')
  update(
    @GetUser('profileId') profileId: number,
    @Body() updateEarningDto: UpdateEarningDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.update(id, updateEarningDto, profileId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.remove(id, profileId);
  }
}
