import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { ISignInParams, ISignUpParmas } from './types/Auth.type';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(
    { email, password, name, phone }: ISignUpParmas,
    userType: UserType,
  ) {
    const userExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) throw new ConflictException();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        user_type: userType,
      },
    });

    return this.generateJWT(user.name, user.id);
  }

  async signIn({ email, password }: ISignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    const hashedPassword = user.password;

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordCorrect)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    return this.generateJWT(user.name, user.id);
  }

  private generateJWT(name: string, id: number) {
    const token = jwt.sign(
      {
        name,
        id,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: 3600000,
      },
    );

    return token;
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }
}
