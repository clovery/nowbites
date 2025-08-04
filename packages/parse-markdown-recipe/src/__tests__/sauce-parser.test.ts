import { parseSauce } from '../sauce-parser';

describe('Sauce Parser', () => {
  describe('parseSauce', () => {
    it('should parse sauce ingredients correctly', () => {
      const sauceContent = `
- 酱油 50g
- 米醋 50g
- 白糖 80g
- 味精 1g
- 料酒 10g
`;

      const result = parseSauce(sauceContent);

      expect(result).toHaveLength(5);

      expect(result[0]).toEqual({
        name: '酱油',
        amount: '50',
        unit: 'g'
      });

      expect(result[1]).toEqual({
        name: '米醋',
        amount: '50',
        unit: 'g'
      });

      expect(result[2]).toEqual({
        name: '白糖',
        amount: '80',
        unit: 'g'
      });

      expect(result[3]).toEqual({
        name: '味精',
        amount: '1',
        unit: 'g'
      });

      expect(result[4]).toEqual({
        name: '料酒',
        amount: '10',
        unit: 'g'
      });
    });

    it('should handle empty sauce content', () => {
      const result = parseSauce('');
      expect(result).toHaveLength(0);
    });

    it('should handle sauce with different units', () => {
      const sauceContent = `
- 酱油 30ml
- 盐 5g
- 糖 2勺
`;

      const result = parseSauce(sauceContent);

      expect(result[0]).toEqual({
        name: '酱油',
        amount: '30',
        unit: 'ml'
      });

      expect(result[1]).toEqual({
        name: '盐',
        amount: '5',
        unit: 'g'
      });

      expect(result[2]).toEqual({
        name: '糖',
        amount: '2',
        unit: '勺'
      });
    });

    it('should handle sauce with decimal amounts', () => {
      const sauceContent = `
- 酱油 25.5g
- 醋 12.5ml
`;

      const result = parseSauce(sauceContent);

      expect(result[0]).toEqual({
        name: '酱油',
        amount: '25.5',
        unit: 'g'
      });

      expect(result[1]).toEqual({
        name: '醋',
        amount: '12.5',
        unit: 'ml'
      });
    });

    it('should ignore non-sauce lines', () => {
      const sauceContent = `
- 酱油 50g
Some other text
- 醋 30g
`;

      const result = parseSauce(sauceContent);

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('酱油');
      expect(result[1]?.name).toBe('醋');
    });

    it('should handle sauce without units', () => {
      const sauceContent = `
- 酱油 50
- 醋 30
`;

      const result = parseSauce(sauceContent);

      expect(result[0]).toEqual({
        name: '酱油',
        amount: '50',
        unit: ''
      });

      expect(result[1]).toEqual({
        name: '醋',
        amount: '30',
        unit: ''
      });
    });
  });
}); 