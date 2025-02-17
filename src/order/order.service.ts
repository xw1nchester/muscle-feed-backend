import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(private readonly prismaService: PrismaService) {}

    private get paymentMethodRepository() {
        return this.prismaService.paymentMethod;
    }

    async getPaymentMethods() {
        const paymentMethodsData =
            await this.paymentMethodRepository.findMany();

        const paymentMethods = paymentMethodsData.map(
            ({ id, nameRu, nameHe }) => ({
                id,
                name: { ru: nameRu, he: nameHe }
            })
        );

        return { paymentMethods };
    }
}
