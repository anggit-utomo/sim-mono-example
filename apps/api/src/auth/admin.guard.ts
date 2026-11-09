import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

// Server-to-server only: the dashboard calls with this token from its
// backend, so it never reaches the browser. Generic message on purpose.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: unknown = req.headers['authorization'];
    const expected = process.env.ADMIN_TOKEN ?? '';
    if (
      typeof header !== 'string' ||
      expected.length === 0 ||
      header !== `Bearer ${expected}`
    ) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
