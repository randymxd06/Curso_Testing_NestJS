import { plainToClass } from "class-transformer"
import { PaginationDto } from "./pagination.dto"
import { validate } from "class-validator"

describe('PaginationDto', () => {

    it('should work with default parameters', async () => {
        const dto = plainToClass(PaginationDto, {});
        const errors = await validate(dto);
        expect(dto).toBeDefined();
        expect(errors.length).toBe(0);
    });
    
    it('should validate limit as a positive number', async () => {
        const dto = plainToClass(PaginationDto, { limit: -1 });
        const errors = await validate(dto);
        const limitError = errors.find(error => error.property === 'limit');
        expect(errors.length).toBeGreaterThan(0);
        expect(limitError.constraints.isPositive).toBeDefined();
    });

    it('should validate offset as a non-negative number', async () => {
        const dto = plainToClass(PaginationDto, { offset: -1 });
        const errors = await validate(dto);
        const offsetError = errors.find(error => error.property === 'offset');
        expect(errors.length).toBeGreaterThan(0);
        expect(offsetError.constraints.min).toBeDefined();
    });

    it('should allow optional gender field with valid values', async () => {
        const validValues = ['men', 'women', 'unisex', 'kid'];
        validValues.forEach(async (gender) => {
            const dto = plainToClass(PaginationDto, { gender });
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        })
    });
    
    it('should validate gender with invalid values', async () => {
        const invalidValues = ['invalid', 'test', 'other'];
        invalidValues.forEach(async (gender) => {
            const dto = plainToClass(PaginationDto, { gender });
            const errors = await validate(dto);
            const genderError = errors.find(error => error.property === 'gender')
            expect(genderError).toBeDefined();
            expect(genderError.constraints.isIn).toBeDefined();
        })
    });

})