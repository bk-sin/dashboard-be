import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

// Un solo tipo para todas las respuestas
export type UserResponse = Prisma.UserGetPayload<{
  include: {
    role: {
      include: {
        rolePermissions: {
          include: {
            permission: true;
          };
          where: {
            isActive: true;
          };
        };
      };
    };
    userPermissions: {
      include: {
        permission: true;
      };
      where: {
        isActive: true;
      };
    };
  };
  omit: {
    password: true;
  };
}>;

export type UserResponseWithPassword = Prisma.UserGetPayload<{
  include: {
    role: {
      include: {
        rolePermissions: {
          include: {
            permission: true;
          };
          where: {
            isActive: true;
          };
        };
      };
    };
    userPermissions: {
      include: {
        permission: true;
      };
      where: {
        isActive: true;
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });
    return user;
  }

  async findAll(): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<UserResponse | null> {
    const user = this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });
    return user;
  }

  async findOneByEmail(
    email: string,
  ): Promise<UserResponseWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });
    return user;
  }

  async findOneWithRole(id: number): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });
  }

  async remove(id: number): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });
    return true;
  }
}
