import { sum } from "./sum.helper";

describe('sum.helper.ts', () => {

    it('should sum two numbers', () => {
    
        // Arrange
        const num1 = 5;
        const num2 = 5;
    
        // Act
        const result = sum(num1, num2);
    
        // Assert
        expect(result).toBe(10);
    
    });

});
