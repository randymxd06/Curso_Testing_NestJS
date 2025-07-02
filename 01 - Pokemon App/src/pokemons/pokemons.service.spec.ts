import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

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
    expect(result).toEqual({
      id: expect.any(Number),
      name: "Pikachu",
      type: "Electric",
      hp: 0,
      sprites: []
    })
  });

  it('should throw an error if pokemon exists', async () => {

    const data = { name: 'Pikachu', type: 'Electric' };
    await service.create(data);

    try {
      await service.create(data);
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(`Pokemon with name ${data.name} already exists`);
    }

    // expect(service.create(data)).rejects.toThrow(BadRequestException);

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
  
  it("should return a pokemon from cache", async () => {
    
    const cacheSpy = jest.spyOn(service.pokemonCache, 'get');
    const pokemonId = 1;
    
    await service.findOne(pokemonId);
    await service.findOne(pokemonId);

    expect(cacheSpy).toHaveBeenCalledTimes(1);

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
    expect(service.paginatedPokemonCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonCache.get('10-1')).toBe(pokemons);
  });
  
  it('should return pokemons from cache', async () => {
    
    const cacheSpy = jest.spyOn(service.paginatedPokemonCache, 'get');
    const fetchSpy = jest.spyOn(global, 'fetch');
     
    await service.findAll({ limit: 10, page: 1 });
    await service.findAll({ limit: 10, page: 1 });

    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith('10-1');

    expect(fetchSpy).toHaveBeenCalledTimes(11);

  });

  it('should update pokemon', async () => {
    
    const pokemonId = 1;
    const dto: UpdatePokemonDto = { name: 'Charmander 6'}

    const updatedPokemon = await service.update(pokemonId, dto);

    expect(updatedPokemon).toEqual({
      id: 1,
      name: dto.name,
      type: 'grass',
      hp: 45,
      sprites: [
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png",
      ]
    })

  });
  
  it('should not update if pokemon not exists', async () => {
    
    const pokemonId = 1_000_000;
    const dto: UpdatePokemonDto = { name: 'Charmander 6'}

    try {
      await service.update(pokemonId, dto)
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(`Pokemon with id ${pokemonId} not found`);
    }

    // await expect(service.update(pokemonId, dto)).rejects.toThrow(NotFoundException);

  });
  
  it('should removed pokemon from cache', async () => {
    
    const pokemonId = 1;

    await service.findOne(pokemonId);
    await service.remove(pokemonId);

    expect(service.pokemonCache.get(pokemonId)).toBeUndefined();

  });

});
