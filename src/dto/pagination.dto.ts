export class PaginationDto<T> {
    [key: string]: T[] | number | boolean;
    totalCount: number
    isLast: boolean
    elementsCount: number

    constructor(elementsProperty: string, elements: T[], totalCount: number, limit: number, offset: number) {
        this[elementsProperty] = elements;
        this.totalCount = totalCount;
        this.isLast = totalCount <= offset + limit;
        this.elementsCount = elements.length;
    }
}
