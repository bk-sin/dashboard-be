import { PickType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class LoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}

export class RegisterDto extends OmitType(CreateUserDto, ['roleId']) {}
