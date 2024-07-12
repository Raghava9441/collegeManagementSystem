interface PaginationOptions {
    page?: number;
    limit?: number;
    customLabels?: Record<string, string>;
}

interface MongoosePaginationOptions {
    page: number;
    limit: number;
    pagination: boolean;
    customLabels: Record<string, string>;
}

export const getMongoosePaginationOptions = ({
    page = 1,
    limit = 10,
    customLabels = {},
}: PaginationOptions): MongoosePaginationOptions => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 1),
        pagination: true,
        customLabels: {
            pagingCounter: "serialNumberStartFrom",
            ...customLabels,
        },
    };
};
