import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { ICreateHomeParams, IFilteredHome } from './types/home.type';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes({
    city,
    price,
    propertyType,
  }: IFilteredHome): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
        },
      },
      where: {
        city,
        price,
        property_type: propertyType,
      },
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map(
      (home) => new HomeResponseDto({ ...home, image: home.images[0].url }),
    );
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findFirst({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
        },
      },
      where: {
        id,
      },
    });

    return new HomeResponseDto(home);
  }

  async createHome({
    address,
    numberOfBathrooms,
    numberOfBedrooms,
    city,
    landSize,
    propertyType,
    price,
    images,
  }: ICreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        property_type: propertyType,
        price,
        realtor_id: 5,
      },
    });

    const homeImages = images.map((image) => ({ ...image, home_id: home.id }));

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }
}
