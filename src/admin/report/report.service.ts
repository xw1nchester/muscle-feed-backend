import { Workbook } from 'exceljs';
import { Response } from 'express';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@prisma/prisma.service';

import { DishService } from '@dish/dish.service';
import { MenuService } from '@menu/menu.service';

@Injectable()
export class ReportService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly dishService: DishService,
        private readonly menuService: MenuService,
        private readonly configService: ConfigService
    ) {}

    async getInserts(date: Date) {
        const ordersData = await this.prismaService.order.findMany({
            select: {
                id: true,
                menu: {
                    include: {
                        menuType: { select: { backgroundPicture: true } }
                    }
                },
                orderDays: {
                    where: {
                        date
                    },
                    select: {
                        orderDayDishes: {
                            where: { isSelected: true },
                            select: { dish: { include: { dishType: true } } },
                            orderBy: { dishTypeId: 'asc' }
                        }
                    }
                }
            },
            where: {
                isProcessed: true,
                isIndividual: false,
                isCompleted: false,
                orderDays: {
                    some: {
                        date,
                        isSkipped: false,
                        daySkipType: null
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        const orders = ordersData.map(({ id, menu, orderDays }) => {
            const dishes = orderDays.flatMap(({ orderDayDishes }) =>
                orderDayDishes.map(({ dish }) =>
                    this.dishService.createDto(dish)
                )
            );

            const total = this.menuService.calculateTotalNutrients(dishes);

            return {
                id,
                menu: this.menuService.createShortDto(menu),
                dishes,
                total
            };
        });

        return { orders };
    }

    async getRouteList(res: Response, startDate: Date, endDate: Date) {
        const orders = await this.prismaService.order.findMany({
            select: {
                id: true,
                fullName: true,
                phone: true,
                city: true,
                street: true,
                house: true,
                floor: true,
                apartment: true,
                comment: true,
                isPaid: true,
                paidAmount: true,
                finalPrice: true,
                paymentMethod: true
            },
            where: {
                isProcessed: true,
                isCompleted: false,
                orderDays: {
                    some: {
                        date: { gte: startDate, lte: endDate },
                        isSkipped: false
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        const workbook = new Workbook();

        const worksheet = workbook.addWorksheet();

        worksheet.columns = [
            { header: '#', key: 'id' },
            { header: 'Заказчик', key: 'fullName', width: 20 },
            { header: 'Телефон', key: 'phone', width: 20 },
            { header: 'Адрес', key: 'address', width: 50 },
            { header: 'Комментарий', key: 'comment', width: 100 },
            { header: 'Цена', key: 'price', width: 10 },
            { header: 'Способ оплаты', key: 'paymentMethod', width: 40 }
        ];

        worksheet.spliceRows(1, 0, []);

        const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

        const titleRow = worksheet.getRow(1);
        titleRow.getCell(1).value = dateRange;

        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);

        titleRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const headerRow = worksheet.getRow(2);

        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        for (const {
            id,
            fullName,
            phone,
            city,
            street,
            house,
            floor,
            apartment,
            comment,
            isPaid,
            paidAmount,
            finalPrice,
            paymentMethod
        } of orders) {
            let address = `${city.nameHe}, ${street} ${house}`;

            if (floor) {
                address += `, ${floor} этаж`;
            }

            if (apartment) {
                address += `, кв. ${apartment}`;
            }

            const price = !isPaid ? finalPrice - paidAmount : 0;

            const row = worksheet.addRow({
                id,
                fullName,
                phone,
                address,
                comment,
                price,
                paymentMethod: paymentMethod.nameRu
            });

            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    wrapText: true
                };
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return res
            .set('Content-Disposition', `attachment; filename=route_list.xlsx`)
            .send(buffer);
    }

    async getDishReport(res: Response, startDate: Date, endDate: Date) {
        const distinctDishes = await this.prismaService.dish.findMany({
            distinct: 'nameRu',
            select: { nameRu: true }
        });

        const result: {
            name: string;
            menus: { name: string; count: number }[];
            totalCount: number;
        }[] = [];

        for (const { nameRu } of distinctDishes) {
            const orderDayDishes =
                await this.prismaService.orderDayDish.findMany({
                    where: {
                        dish: { nameRu },
                        isSelected: true,
                        orderDay: {
                            isSkipped: false,
                            daySkipType: null,
                            date: { gte: startDate, lte: endDate },
                            order: {
                                isProcessed: true,
                                isCompleted: false
                            }
                        }
                    },
                    select: {
                        count: true,
                        orderDay: {
                            select: {
                                order: {
                                    select: {
                                        menu: { select: { nameRu: true } }
                                    }
                                }
                            }
                        }
                    }
                });

            let totalCount = 0;

            const menus = orderDayDishes.reduce((acc, item) => {
                const name =
                    item.orderDay.order?.menu?.nameRu ||
                    this.configService.get('INDIVIDUAL_ORDER_MENU_NAME');
                const existingItem = acc.find(el => el.name === name);

                const { count } = item;

                if (existingItem) {
                    existingItem.count += count;
                } else {
                    acc.push({ name, count });
                }

                totalCount += count;

                return acc;
            }, []);

            if (orderDayDishes.length > 0) {
                result.push({ name: nameRu, menus, totalCount });
            }
        }

        const workbook = new Workbook();

        const worksheet = workbook.addWorksheet();

        worksheet.columns = [
            { header: 'Блюдо', key: 'dishName', width: 50 },
            { header: 'План питания', key: 'menu', width: 50 },
            { header: 'Количество', key: 'count', width: 12 },
            { header: 'Всего', key: 'total', width: 6 }
        ];

        worksheet.spliceRows(1, 0, []);

        const title = `Блюда ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

        const titleRow = worksheet.getRow(1);
        titleRow.getCell(1).value = title;

        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);

        titleRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const headerRow = worksheet.getRow(2);

        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        let currentRow = 3;

        result.forEach(item => {
            const rowSpan = item.menus.length;

            item.menus.forEach((menu, index) => {
                const addedRow = worksheet.addRow({
                    dishName: item.name,
                    menu: menu.name,
                    count: menu.count,
                    total: index === 0 ? item.totalCount : null
                });

                addedRow.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = {
                        horizontal: 'center',
                        vertical: 'middle'
                    };
                });
            });

            if (rowSpan > 1) {
                worksheet.mergeCells(
                    currentRow,
                    4,
                    currentRow + rowSpan - 1,
                    4
                );
            }

            currentRow += rowSpan;
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return res
            .set('Content-Disposition', `attachment; filename=dishes.xlsx`)
            .send(buffer);
    }
}
