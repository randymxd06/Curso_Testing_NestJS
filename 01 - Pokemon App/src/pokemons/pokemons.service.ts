import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeApiResponse } from './interfaces/pokeapi.response';
import { PokeAPIPokemonResponse } from './interfaces/pokeapi-pokemon.response';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {

  paginatedPokemonCache = new Map<string, Pokemon[]>();
  pokemonCache = new Map<number, Pokemon>();

  create(createPokemonDto: CreatePokemonDto) {

    const pokemon: Pokemon = {
      ...createPokemonDto,
      id: new Date().getTime(),
      hp: createPokemonDto.hp ?? 0,
      sprites: createPokemonDto.sprites ?? []
    }

    this.pokemonCache.forEach(storePokemon => {
      if(pokemon.name === storePokemon.name) {
        throw new BadRequestException(`Pokemon with name ${pokemon.name} already exists`)
      }
    });

    this.pokemonCache.set(pokemon.id, pokemon);

    return Promise.resolve(pokemon);

  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `${limit}-${page}`;

    if(this.paginatedPokemonCache.has(cacheKey)) {
      return this.paginatedPokemonCache.get(cacheKey);
    }
    
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    const data = (await response.json()) as PokeApiResponse;

    const pokemonPromises = data.results.map(pokemon => {
      const url = pokemon.url;
      const id = url.split('/').slice(-2)[0]
      return this.getPokemonInformation(+id);
    });

    const pokemons = await Promise.all(pokemonPromises);
    
    this.paginatedPokemonCache.set(cacheKey, pokemons);

    return pokemons;

  }

  async findOne(id: number) {

    if(this.pokemonCache.has(id)) {
      return this.pokemonCache.get(id);
    }

    const pokemon = await this.getPokemonInformation(id);
    this.pokemonCache.set(id, pokemon);

    return pokemon;

  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(id);

    const updatedPokemon = {
      ...pokemon,
      ...updatePokemonDto
    }

    this.pokemonCache.set(id, updatedPokemon);

    return Promise.resolve(updatedPokemon);

  }

  async remove(id: number) {

    const pokemon = await this.findOne(id);

    this.pokemonCache.delete(id);

    return Promise.resolve(`Pokemon ${pokemon.name} removed`);

  }

  private async getPokemonInformation(id:  number): Promise<Pokemon> {

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if(response.status === 404) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    const data = (await response.json()) as PokeAPIPokemonResponse;

    return {
      id: data.id,
      name: data.name,
      type: data.types[0].type.name,
      hp: data.stats[0].base_stat,
      sprites: [
        data.sprites.front_default,
        data.sprites.back_default
      ]
    }

  }

}
