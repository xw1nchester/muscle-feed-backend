import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtPayload } from '@auth/interfaces';
import { Role } from '@auth/decorators';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        ctx: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        const requiredRole = this.reflector.get(Role, ctx.getHandler());

        if (!user.roles.find(role => role == requiredRole)) {
            return false;
        }

        return true;
    }
}
