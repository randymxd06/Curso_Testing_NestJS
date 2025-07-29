import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";
import { plainToClass } from "class-transformer";
import { LoginUserDto } from "./login-user.dto";

describe('LoginUserDto', () => {

    it('should have correct properties', async () => {

        const dto = plainToClass(LoginUserDto, {
            email: 'test@gmail.com',
            password: '@Password123'
        })

        const errors = await validate(dto);

        expect(errors.length).toBe(0);

    });

    it('should throw errors if password is not valid', async () => {

        const dto = plainToClass(LoginUserDto, {
            email: 'test@gmail.com',
            password: 'password123'
        })

        const errors = await validate(dto);

        const passwordError = errors.find(error => error.property === 'password');

        expect(passwordError).toBeDefined();
        expect(passwordError.constraints).toBeDefined();
        expect(passwordError.constraints.matches).toBe('The password must have a Uppercase, lowercase letter and a number');
        
    });

});