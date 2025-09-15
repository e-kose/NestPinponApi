import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const internal_key = request.headers['x-internal-key'];
    if (!internal_key) throw new UnauthorizedException('Missing internal-key');
    if (internal_key !== process.env.INTERNAL_API_KEY)
      throw new UnauthorizedException('Invalid internal key');
    return true;
  }
}
