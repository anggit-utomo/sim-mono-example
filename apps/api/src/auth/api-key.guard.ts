import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

function allowedKeys(): string[] {
  return (process.env.INGEST_API_KEYS ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

// Generic message on purpose: never hint whether the path, method, or key was wrong.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const presented = req.headers['x-api-key'];
    if (typeof presented !== 'string' || !allowedKeys().includes(presented)) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
