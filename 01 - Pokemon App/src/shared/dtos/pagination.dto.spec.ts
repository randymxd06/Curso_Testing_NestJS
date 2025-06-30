import 'reflect-metadata';
import { validate } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { plainToInstance } from 'class-transformer';

describe('PaginationDto', () => {

    it('should validate with default values', async () => {
        
        const dto = new PaginationDto();
        const errors = await validate(dto);

        expect(errors.length).toBe(0);

    });

    it('should validate with valid data', async () => {

        const dto = new PaginationDto();
        dto.page = 1;
        dto.limit = 20;

        const errors = await validate(dto);

        expect(errors.length).toBe(0);

    });

    it('should not validate with invalid page', async () => {

        const dto = new PaginationDto();

        dto.page = -1;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(1);

        errors.forEach(error => {
            if(error.property === 'page') {
                expect(error.constraints.min).toBeDefined();
            } else {
                expect(true).toBeFalsy();
            }
        })

    });

    it('should not validate with invalid limit', async () => {

        const dto = new PaginationDto();

        dto.limit = -10;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(1);

        errors.forEach(error => {
            if(error.property === 'limit') {
                expect(error.constraints.min).toBeDefined();
            } else {
                expect(true).toBeFalsy();
            }
        })

    });

    it('should convert strings into numbers', async () => {
        
        const input = { limit: '10', page: '2' };
        const dto = plainToInstance(PaginationDto, input);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.limit).toBe(10);
        expect(dto.page).toBe(2);

    });

});