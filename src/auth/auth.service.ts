import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponse, UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async _createToken(user: UserResponse) {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      role: user.role.slug,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.role?.permissions) {
      throw new UnauthorizedException(
        'Access denied: No role permissions found',
      );
    }

    const permissions = user.role.permissions as Record<string, boolean>;
    if (!permissions['dashboard.access']) {
      throw new UnauthorizedException(
        'Access denied: Dashboard permissions required',
      );
    }

    const token = await this._createToken(user);
    return new LoginResponseDto(user, token.access_token);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this._createToken(user);
  }
}
