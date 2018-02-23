'use strict';

const fs = require('fs');
const _ = require('lodash');
const bigInt = require("big-integer");

const INPUT_FILE = 'input/input_2.txt';
const MAX_NUMBER_OF_SPICES = Math.pow(10, 4);
const MAX_PRICE_OF_SPICE = bigInt(Math.pow(10, 18));
const MAX_NUMBER_OF_RECIPES = 3 * Math.pow(10, 4);
const MAX_VALUE_FOR_C = MAX_PRICE_OF_SPICE;

const loadInput = () => {
    const input = fs.readFileSync(INPUT_FILE, 'utf-8');
    const splitInput = input.split('\n');

    return {
        spicesNumber: parseInt(splitInput[0]),
        spicesPrice: splitInput[1].split(' ').map(price => bigInt(price)),
        recipesNumber: parseInt(splitInput[2]),
        recipes: splitInput.slice(3).map((recipe) => {
            const splitRecipe = recipe.split(' ');
            return {
                radix: parseInt(splitRecipe[0]),
                pattern: splitRecipe[1],
                c: bigInt(splitRecipe[2])
            };
        })
    };
};

const validateInput = (input) => {
    const spicesNumber = input.spicesNumber;
    const spicesPrice = input.spicesPrice;
    const recipesNumber = input.recipesNumber;
    const recipes = input.recipes;

    if (isNaN(spicesNumber) || (spicesNumber < 1 || spicesNumber > MAX_NUMBER_OF_SPICES)) {
        throw new Error('Invalid number of spices');
    }

    const invalidSpicesPrice = !Array.isArray(spicesPrice) || spicesPrice.length !== spicesNumber || spicesPrice.find((price) => {
        return price.compare(1) === -1 || price.compare(MAX_PRICE_OF_SPICE) === 1;
    });

    if (invalidSpicesPrice) {
        throw new Error('At least one spice price is invalid');
    }

    if (isNaN(recipesNumber) || (recipesNumber < 1 || recipesNumber > MAX_NUMBER_OF_RECIPES)) {
        throw new Error('Invalid number of spices');
    }

    const invalidRecipes = !Array.isArray(recipes) || recipes.length !== recipesNumber || recipes.find((recipe) => {
        const radix = recipe.radix;
        const pattern = recipe.pattern;
        const c = recipe.c;

        return (isNaN(radix) || (radix < 2 || radix > 16)) ||
            (!pattern || (pattern.length < 1 || pattern.length > 30) || pattern.match(/^([A-F0-9?])+$/) === null) ||
            (c.compare(1) === -1 || c.compare(MAX_VALUE_FOR_C) === 1);
    });

    if (invalidRecipes) {
        throw new Error('At least one recipe has invalid values');
    }
};

const loadPrimes = (primes, number) => {
    if (number >= 100) return primes;

    for (let i = 2; i < number; i++) {
        if (number % i === 0) {
            return loadPrimes(primes, number + 1);
        }
    }

    primes.push(number);

    return loadPrimes(primes, number + 1);
};

const findNumbersMatchingPattern = (radix, pattern, spicesNumber) => {
    const numbers = [];
    const patternRegex = new RegExp(`^${pattern.replace(/\?/g, '(.)')}$`);

    for (let i = 0; i < spicesNumber; i++) {
        const parsedNumber = _.padStart(i.toString(radix), pattern.length, '0');
        if (parsedNumber.match(patternRegex)) {
            numbers.push(i);
        }
    }

    return numbers;
};

const run = () => {
    try {
        const input = loadInput();
        validateInput(input);

        const primes = loadPrimes([], 2);

        input.recipes.forEach((recipe) => {
            const indexes = findNumbersMatchingPattern(recipe.radix, recipe.pattern, input.spicesNumber);
            const product = indexes.reduce((acc, index) => acc.times(input.spicesPrice[index]), bigInt(1));
            const z = product.add(recipe.c);
            const prime = primes.find(prime => z.mod(prime).value === 0);
            console.log(prime || -1);
        });
    } catch (error) {
        console.log('ERROR:', error);
        return -1;
    }
};

run();

process.exit(0);