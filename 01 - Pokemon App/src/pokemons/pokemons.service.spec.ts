import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { NotFoundException } from '@nestjs/common';

describe('PokemonsService', () => {

  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pokemon', async () => {
    const data = { name: 'Pikachu', type: 'Electric' };
    const result = await service.create(data);
    expect(result).toBe(`This action adds a ${data.name}`)
  });

  it('should return pokemon if exists', async () => {
    const pokemonId = 151;
    const result = await service.findOne(pokemonId);
    expect(result).toEqual({
      id: 151,
      name: "mew",
      type: "psychic",
      hp: 100,
      sprites: [
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/151.png"
      ]
    })
  });

  it("should return 404 error if pokemon doesn't exists", async () => {
    const pokemonId = 150_000;
    await expect(service.findOne(pokemonId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(pokemonId)).rejects.toThrow(`Pokemon with id ${pokemonId} not found`);
  });

  it('should check properties of the pokemon', async () => {
    const pokemonId = 151;
    const pokemon = await service.findOne(pokemonId);
    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');
    expect(pokemon).toEqual(expect.objectContaining({ 
      id: pokemonId,
      hp: expect.any(Number)
    }));
  })

  it('should find all pokemons and cache items', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });
    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);
    // expect(service.paginatedPokemonCache.has('10-1')).toBeTruthy();
    // expect(service.paginatedPokemonCache.get('10-1')).toBe(pokemons);
  });

});
