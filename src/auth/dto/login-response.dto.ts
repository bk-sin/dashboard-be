export type UserLike = {
  id: number;
  email: string;
  roleId: number;
  firstName?: string;
  lastName?: string;
};

export class LoginResponseDto {
  id: number;
  email: string;
  roleId: number;
  access_token: string;
  firstName?: string;
  lastName?: string;

  constructor(user: UserLike, access_token: string) {
    this.id = user.id;
    this.email = user.email;
    this.roleId = user.roleId;
    this.access_token = access_token;
    if (user.firstName) this.firstName = user.firstName;
    if (user.lastName) this.lastName = user.lastName;
  }
}
