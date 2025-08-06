import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { IsPublic } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate a user and return JWT token',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      customer: {
        summary: 'Customer Login',
        description: 'Login as a customer user',
        value: {
          email: 'customer@test.com',
          password: 'customer123',
        },
      },
      employee: {
        summary: 'Employee Login',
        description: 'Login as an employee user',
        value: {
          email: 'employee@test.com',
          password: 'employee123',
        },
      },
      manager: {
        summary: 'Manager Login',
        description: 'Login as a manager user',
        value: {
          email: 'manager@test.com',
          password: 'manager123',
        },
      },
      admin: {
        summary: 'Admin Login',
        description: 'Login as an admin user',
        value: {
          email: 'admin@test.com',
          password: 'admin123',
        },
      },
      superadmin: {
        summary: 'Super Admin Login',
        description: 'Login as a super admin user',
        value: {
          email: 'superadmin@test.com',
          password: 'superadmin123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'customer@test.com' },
            roleId: { type: 'number', example: 1 },
            role: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Customer' },
                slug: { type: 'string', example: 'customer' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @IsPublic()
  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      customer: {
        summary: 'Register as Customer',
        description: 'Register a new customer account',
        value: {
          firstName: 'Ana',
          lastName: 'López',
          email: 'ana.lopez@email.com',
          password: 'password123',
          phone: '+1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 6 },
        firstName: { type: 'string', example: 'Ana' },
        lastName: { type: 'string', example: 'López' },
        email: { type: 'string', example: 'ana.lopez@email.com' },
        roleId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        isVerified: { type: 'boolean', example: false },
        isBlocked: { type: 'boolean', example: false },
        createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
