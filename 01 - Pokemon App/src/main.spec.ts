import { NestFactory } from "@nestjs/core";
import { bootstrap } from "./main";
import { AppModule } from "./app.module";

jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn().mockResolvedValue({
            useGlobalPipes: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn()
        })
    }
}))

describe('Main.ts Bootstrap', () => {

    let mockApp: {
        useGlobalPipes: jest.Mock;
        setGlobalPrefix: jest.Mock;
        listen: jest.Mock;
    };

    beforeEach(() => {
        mockApp = {
            useGlobalPipes: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn(),
        };
        (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    })

    it('should create application', async () => {
        await bootstrap();
        expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    });

    it('should set global prefix', async () => {
        await bootstrap();
        expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    });

    it('should listen on port 3000 if env port not set', async () => {
        await bootstrap();
        expect(mockApp.listen).toHaveBeenCalledWith(3000);
    });
    
    it('should listen on env port', async () => {
        process.env.PORT = '4200';
        await bootstrap();
        expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT);
    });

    it('should use global pipes', async () => {
        await bootstrap();
        expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
            expect.objectContaining({
                errorHttpStatusCode: 400,
                validatorOptions: expect.objectContaining({
                    whitelist: true,
                    forbidNonWhitelisted: true
                })
            })
        );
    });

});