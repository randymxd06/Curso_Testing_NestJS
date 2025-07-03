import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';
import { UpdatePokemonDto } from 'src/pokemons/dto/update-pokemon.dto';

describe('Pokemons (e2e)', () => {

  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      })
    );
    await app.init();
  });

  it('/pokemons (POST) - with no body', async () => {
    
    const response =  await request(app.getHttpServer()).post('/pokemons');
    const messageArray =  response.body.message ?? [];

    expect(response.statusCode).toBe(400);

    expect(messageArray).toContain('name must be a string');
    expect(messageArray).toContain('name should not be empty');
    expect(messageArray).toContain('type must be a string');
    expect(messageArray).toContain('type should not be empty');

  });
  
  it('/pokemons (POST) - with no body 2', async () => {
    
    const response =  await request(app.getHttpServer()).post('/pokemons');
    const messageArray: string[] =  response.body.message ?? [];
    const mostHaveErrorMessage = [
      'name must be a string',
      'name should not be empty',
      'type must be a string',
      'type should not be empty'
    ];

    expect(mostHaveErrorMessage.length).toBe(messageArray.length);
    expect(messageArray).toEqual(expect.arrayContaining(mostHaveErrorMessage));

  });
  
  it('/pokemons (POST) - with valid body', async () => {
    
    const response =  await request(app.getHttpServer()).post('/pokemons').send({
      name: 'Pikachu',
      type: 'Electric'
    });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Pikachu',
        type: 'Electric',
        id: expect.any(Number),
        hp: 0,
        sprites: []
      })
    )

  });

  it('/pokemons (Get) should return paginated list of pokemons', async () => {

    const response  = await request(app.getHttpServer()).get('/pokemons').query({ limit: 5, page: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);
    
    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('sprites');
      // expect(pokemon).toEqual({
      //   id: expect.any(Number),
      //   name: expect.any(String),
      //   type: expect.any(String),
      //   hp: expect.any(Number),
      //   sprites: expect.any(Array),
      // })
    })

  });
  
  it('/pokemons (Get) should return 20 paginated pokemons', async () => {

    const response = await request(app.getHttpServer()).get('/pokemons').query({ limit: 20, page: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(20);

  });

  it('/pokemons/:id (Get) should return a pokemon by id', async () => {

    const response = await request(app.getHttpServer()).get('/pokemons/1');

    const pokemon = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemon).toEqual({
      id: 1,
      name: 'bulbasaur',
      type: 'grass',
      hp: 45,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png'
      ]
    });

  });
  
  it('/pokemons/:id (Get) should return a Charmander', async () => {

    const response = await request(app.getHttpServer()).get('/pokemons/4');

    const pokemon = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemon).toEqual({
      id: 4,
      name: 'charmander',
      type: 'fire',
      hp: 39,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png'
      ]
    });

  });

  it('/pokemons/:id (Get) should return not found', async () => {

    const pokemonId = 20_000;
    const response = await request(app.getHttpServer()).get(`/pokemons/${pokemonId}`);

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404
    })

  });

  it('/pokemons/:id (PATCH) should update pokemon', async () => {
    const pokemonId = 1;
    const dto: UpdatePokemonDto = { name: 'Pikachu', type: 'Electric' };
    const pokemonResponse = await request(app.getHttpServer()).get(`/pokemons/${pokemonId}`);
    const bulbasaur = pokemonResponse.body as Pokemon;
    const response = await request(app.getHttpServer()).patch(`/pokemons/${pokemonId}`).send(dto);
    const updatedPokemon = response.body as Pokemon;

    expect(bulbasaur.hp).toBe(updatedPokemon.hp);
    expect(bulbasaur.id).toBe(updatedPokemon.id);
    expect(bulbasaur.sprites).toEqual(updatedPokemon.sprites);
    expect(updatedPokemon.name).toEqual(dto.name);
    expect(updatedPokemon.type).toEqual(dto.type);

  });
  
  it('/pokemons/:id (PATCH) should throw an 404', async () => {
    const pokemonId = 200_000;
    const response = await request(app.getHttpServer()).patch(`/pokemons/${pokemonId}`).send({});
    expect(response.statusCode).toBe(404);
  });
  
  it('/pokemons/:id (DELETE) should delete pokemon', async () => {
    const pokemonId = 1;
    const response = await request(app.getHttpServer()).delete(`/pokemons/${pokemonId}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(`Pokemon bulbasaur removed`)
  });
  
  it('/pokemons/:id (DELETE) should throw an 404', async () => {
    const pokemonId = 200_000;
    const response = await request(app.getHttpServer()).delete(`/pokemons/${pokemonId}`);
    expect(response.statusCode).toBe(404);
  });

});
