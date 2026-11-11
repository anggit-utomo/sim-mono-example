import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';
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

// Max rows per request: keeps one call bounded (1 inbox bulk + 1 Redis bulk).
const MAX_BATCH = 100;

@UseGuards(ApiKeyGuard)
@Controller()
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  // Accept a single object, a raw array, or { items: [...] }; always validate
  // each row with the same rules as the old single-object endpoint.
  private async toValidDtos(body: unknown): Promise<CustomerDto[]> {
    let raw: unknown[];
    if (Array.isArray(body)) {
      raw = body;
    } else if (body !== null && typeof body === 'object' && 'items' in body && Array.isArray(body.items)) {
      raw = body.items;
    } else {
      raw = [body];
    }
    if (raw.length < 1 || raw.length > MAX_BATCH) {
      throw new BadRequestException(`body must hold 1-${MAX_BATCH} customer(s)`);
    }
    const dtos = plainToInstance(CustomerDto, raw);
    const problems = (
      await Promise.all(dtos.map((d) => validate(d, { whitelist: true, forbidNonWhitelisted: true })))
    ).flat();
    if (problems.length > 0) {
      throw new BadRequestException(
        problems.map((p) => `${p.property}: ${Object.values(p.constraints ?? {}).join(', ')}`),
      );
    }
    return dtos;
  }

  @Post('create-customer')
  @HttpCode(202)
  async create(@Body() body: unknown) {
    return this.customers.acceptMany('CREATE', await this.toValidDtos(body));
  }

  @Post('update-customer')
  @HttpCode(202)
  async update(@Body() body: unknown) {
    return this.customers.acceptMany('UPDATE', await this.toValidDtos(body));
  }
}
