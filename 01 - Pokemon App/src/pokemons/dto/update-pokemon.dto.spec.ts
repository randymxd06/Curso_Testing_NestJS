import { validate } from "class-validator";
import { UpdatePokemonDto } from "./update-pokemon.dto";

describe('UpdatePokemonDto', () => {

    it('should be valid with correct data', async () => {

        const dto = new UpdatePokemonDto();
        const errors = await validate(dto);

        expect(errors.length).toBe(0);

    });

    it('should hp must be positive number', async () => {

        const dto = new UpdatePokemonDto();
        dto.hp = -10;

        const errors = await validate(dto)
        const hpErrors = errors.find(error => error.property === 'hp');
        const constraints = hpErrors.constraints;

        expect(hpErrors).toBeDefined();
        expect(constraints).toEqual({ min: 'hp must not be less than 0' })

    });

});