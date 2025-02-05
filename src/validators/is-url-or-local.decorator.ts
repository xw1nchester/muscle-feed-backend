import {
    ValidationOptions,
    registerDecorator
} from 'class-validator';

export const IsUrlOrLocal =
    (options?: ValidationOptions) => (object: object, propertyName: string) => {
        registerDecorator({
            name: 'IsUrlOrLocal',
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            validator: {
                validate(value: any) {
                    if (!value) return true; // Skip empty values, use @IsOptional() for that

                    // Regular expression for validating external URLs
                    const externalUrlPattern =
                        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

                    // Regular expression for validating local URLs (localhost, file://, etc.)
                    const localUrlPattern =
                        /^(file|localhost|127\.0\.0\.1|0\.0\.0\.0):\/\//i;

                    return (
                        externalUrlPattern.test(value) ||
                        localUrlPattern.test(value)
                    );
                },
                defaultMessage() {
                    return 'Invalid URL. It must be a valid external or local URL.';
                }
            }
        });
    };
