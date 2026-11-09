import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CustomersService } from './customers.service';

export class CustomerDto {
  @IsString() @IsNotEmpty() externalId!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
}

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
