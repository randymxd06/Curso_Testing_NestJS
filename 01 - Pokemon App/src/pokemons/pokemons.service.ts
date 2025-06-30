import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeApiResponse } from './interfaces/pokeapi.response';
import { PokeAPIPokemonResponse } from './interfaces/pokeapi-pokemon.response';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {

  paginatedPokemonCache = new Map<string, Pokemon[]>();

  create(createPokemonDto: CreatePokemonDto) {
    return 'This action adds a new pokemon';
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const cacheKey = `${limit}-${offset}`;

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

  findOne(id: number) {
    return `This action returns a #${id} pokemon`;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  private async getPokemonInformation(id:  number): Promise<Pokemon> {

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

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
