export class PaginationDto<T> {
    [key: string]: T[] | number | boolean;
    elementsCount: number;
    page: number;
    totalPages: number;
    isLast: boolean;

    constructor(
        elementsProperty: string,
        elements: T[],
        totalCount: number,
        limit: number,
        page: number
    ) {
        const totalPages = Math.ceil(totalCount / limit);

        this[elementsProperty] = elements;
        this.elementsCount = elements.length;
        this.page = page;
        this.totalPages = totalPages;
        this.isLast = totalPages == page;
    }
}
