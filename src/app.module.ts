import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [UserModule, PrismaModule, HomeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
