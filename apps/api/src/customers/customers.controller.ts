import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { CustomersService } from './customers.service';

export class CustomerDto {
  @IsString()
  @IsNotEmpty()
  externalId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;
}

@UseGuards(ApiKeyGuard)
@Controller()
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post('create-customer')
  @HttpCode(202)
  create(@Body() dto: CustomerDto) {
    return this.customers.accept('CREATE', dto);
  }

  @Post('update-customer')
  @HttpCode(202)
  update(@Body() dto: CustomerDto) {
    return this.customers.accept('UPDATE', dto);
  }
}
