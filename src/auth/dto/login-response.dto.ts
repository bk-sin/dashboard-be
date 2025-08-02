import { UserResponseWithPassword } from 'src/users/users.service';

export class LoginResponseDto {
  id: number;
  email: string;
  role: string;
  access_token: string;
  firstName?: string;
  lastName?: string;

  constructor(user: UserResponseWithPassword, access_token: string) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role.slug;
    this.access_token = access_token;
    if (user.firstName) this.firstName = user.firstName;
    if (user.lastName) this.lastName = user.lastName;
  }
}
