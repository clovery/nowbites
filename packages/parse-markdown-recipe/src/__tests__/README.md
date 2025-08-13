# Ingredients Parser Test Suite

This directory contains the comprehensive test suite for the ingredients parser, organized into multiple focused test files for better maintainability and clarity.

## Test Structure

### 1. `ingredients-parser-integration.test.ts`
**Integration Tests** - Tests the main `parseIngredients` function with real-world scenarios
- Main and auxiliary ingredients parsing
- Mixed format handling
- Edge case scenarios
- End-to-end functionality

### 2. `em-dash-format.test.ts`
**Em Dash Format Parser** - Tests the `—` separator format
- Simple em dash format: `陈皮 — 3 片`
- Complex notes: `大葱段 — 适量（去腥 5 段 + 炒制适量）`
- Chinese units: `红枣 — 2颗`
- Descriptive amounts: `葱花 — 少许`

### 3. `standard-format.test.ts`
**Standard Format Parser** - Tests the standard `name amount(unit) (note)` format
- Basic format: `带鱼 500g`
- With notes: `带鱼 500g（新鲜或冻带鱼）`
- Chinese units: `红枣 2颗`
- Decimal amounts: `盐 2.5g`
- Mixed units: `鸡蛋 2个`, `面粉 200g`

### 4. `descriptive-format.test.ts`
**Descriptive Format Parser** - Tests the `name（description）` format
- Basic descriptions: `水（用于泡淀粉）`
- Complex descriptions: `盐（腌肉 3–5g + 调汁 2g）`
- Cooking instructions: `水（烧开后放凉）`
- Preparation notes: `葱（切葱花）`
- Quality requirements: `带鱼（新鲜或冻带鱼，不能有臭味）`

### 5. `range-format.test.ts`
**Range Format Parser** - Tests the range amount format
- Basic ranges: `白糖 50–60g`
- Chinese units: `红枣 2–3颗`
- Different ranges: `盐 1–2g`, `糖 10–15g`
- Large numbers: `面粉 200–250g`

### 6. `simple-and-name-format.test.ts`
**Simple and Name-Only Format Parser** - Tests simple formats and name-only ingredients
- Simple format: `盐 适量`, `水 半杯`
- Name-only: `葱花`, `香菜`, `姜丝`
- Garnishes: `芝麻`, `枸杞`, `薄荷叶`
- Herbs and spices: `八角`, `桂皮`, `花椒`
- Edge cases with special characters

### 7. `edge-cases.test.ts`
**Edge Cases and Error Handling** - Tests unusual and problematic scenarios
- Malformed ingredients
- Special characters in names
- Mixed punctuation
- Multiple parentheses
- Unusual spacing
- Leading/trailing spaces
- Very long ingredient names
- Numbers in ingredient names

## Test Organization Benefits

### 🔍 **Focused Testing**
Each test file focuses on a specific parsing method, making it easier to:
- Understand what each parser does
- Debug specific format issues
- Add new test cases for specific formats

### 🧹 **Maintainability**
- Smaller, focused files are easier to navigate
- Changes to one format don't affect tests for other formats
- Clear separation of concerns

### 🚀 **Extensibility**
- Easy to add new test files for new formats
- Simple to add new test cases to existing format files
- Clear structure for new developers

### 🧪 **Debugging**
- When a test fails, you know exactly which parser is involved
- Easier to isolate issues to specific format handling
- Better error messages and context

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Format Tests
```bash
# Em dash format only
npm test -- --testPathPattern="em-dash"

# Standard format only
npm test -- --testPathPattern="standard"

# All format tests
npm test -- --testPathPattern="ingredients-parser|em-dash|standard|descriptive|range|simple|edge"
```

### Run Integration Tests Only
```bash
npm test -- --testPathPattern="ingredients-parser-integration"
```

## Adding New Tests

### For Existing Formats
Add new test cases to the appropriate format-specific test file.

### For New Formats
1. Create a new test file: `new-format.test.ts`
2. Follow the naming convention: `describe('New Format Parser', () => {`
3. Add comprehensive test cases
4. Update this README with the new format description

### Test Case Structure
```typescript
it('should handle specific scenario', () => {
  const ingredients = `
- ingredient 1
- ingredient 2
`;

  const result = parseIngredients(ingredients, '');

  expect(result.main[0]).toEqual({
    name: 'expected name',
    amount: 'expected amount',
    unit: 'expected unit',
    note: 'expected note' // if applicable
  });
});
```

## Notes on Parser Priority

The parser follows a specific order of precedence:
1. **Em Dash Format** (`—`) - Highest priority
2. **Standard Format** (`name amount(unit)`) 
3. **Descriptive Format** (`name（description）`)
4. **Range Format** (`name 50–60g`)
5. **Simple Format** (`name amount`)
6. **Name Only Format** (`name`) - Lowest priority

This means that some ingredients might be parsed by a different parser than expected if they match multiple patterns. The test cases reflect the actual parser behavior.
