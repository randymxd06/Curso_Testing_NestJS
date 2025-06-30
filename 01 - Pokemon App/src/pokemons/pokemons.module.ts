import { Module } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import { PokemonsController } from './pokemons.controller';

@Module({
  controllers: [PokemonsController],
  providers: [PokemonsService],
})
export class PokemonsModule {}
