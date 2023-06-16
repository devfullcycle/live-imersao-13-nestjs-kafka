import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma/prisma.service';
import { OrderDto } from './order.dto';
import { OrderStatus } from '.prisma/client/orders';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    @Inject('ORDERS_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  all() {
    return this.prismaService.order.findMany();
  }

  async create(data: OrderDto) {
    const order = await this.prismaService.order.create({
      data: {
        ...data,
        status: OrderStatus.PENDING,
      },
    });
    await lastValueFrom(this.kafkaClient.emit('orders', order));
    return order;
  }

  complete(id: number, status: OrderStatus) {
    console.log(id, status);
    return this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }
}

//dto - data transfer object
