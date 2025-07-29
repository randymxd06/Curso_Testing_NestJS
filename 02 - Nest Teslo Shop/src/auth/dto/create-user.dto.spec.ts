import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

describe('CreateUserDto', () => {

    it('should have correct properties', async () => {

        const dto = new CreateUserDto();

        dto.email = 'test@gmail.com';
        dto.password = '@Password123';
        dto.fullName = 'Test User';

        const errors = await validate(dto);

        expect(errors.length).toBe(0);

    });

    it('should throw errors if password is not valid', async () => {

        const dto = new CreateUserDto();

        dto.email = 'test@gmail.com';
        dto.password = 'password123';
        dto.fullName = 'Test User';

        const errors = await validate(dto);

        const passwordError = errors.find(error => error.property === 'password');

        expect(passwordError).toBeDefined();
        expect(passwordError.constraints).toBeDefined();
        expect(passwordError.constraints.matches).toBe('The password must have a Uppercase, lowercase letter and a number');
        
    });

});