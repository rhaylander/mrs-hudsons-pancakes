'use strict';

const fs = require('fs');
const _ = require('lodash');
const Promise = require('bluebird');
const bigInt = require("big-integer");
const readline = require('readline');

const INPUT_FILE = 'input/input_2.txt';
const MAX_NUMBER_OF_SPICES = Math.pow(10, 4);
const MAX_PRICE_OF_SPICE = bigInt(Math.pow(10, 18));
const MAX_NUMBER_OF_RECIPES = 3 * Math.pow(10, 4);
const MAX_VALUE_FOR_C = MAX_PRICE_OF_SPICE;

const shouldReadInputFromFile = () => {
    return process.argv[2] === '--file';
};

const loadInputFromFile = () => {
    return Promise
        .fromCallback(cb => fs.readFile(INPUT_FILE, 'utf-8', cb))
        .then((input) => input.split('\n'))
};

const loadInputFromStdin = () => (
    new Promise((resolve) => {
        const lines = [];

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (line) => {
            lines.push(line);

            if (lines.length >= 2 && (lines.length === parseInt(lines[2], 10) + 3)) {
                rl.emit('close');
            }
        });

        rl.on('close', () => resolve(lines));
    })
);

const loadInput = () => (
    (shouldReadInputFromFile() ? loadInputFromFile() : loadInputFromStdin())
        .then(lines => ({
            spicesNumber: parseInt(lines[0]),
            spicesPrice: lines[1].split(' ').map(price => bigInt(price)),
            recipesNumber: parseInt(lines[2]),
            recipes: lines.slice(3).map((recipe) => {
                const recipeParts = recipe.split(' ');
                
                return {
                    radix: parseInt(recipeParts[0]),
                    pattern: recipeParts[1],
                    c: bigInt(recipeParts[2])
                };
            })
        }))
);

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

    for (let k = 0; k < spicesNumber; k++) {
        const parsedNumber = _.padStart(k.toString(radix), pattern.length, '0');
        if (parsedNumber.match(patternRegex)) {
            numbers.push(k);
        }
    }

    return numbers;
};

const run = () => {
    return loadInput().then((input) => {
        validateInput(input);

        const primes = loadPrimes([], 2);

        input.recipes.forEach((recipe) => {
            const indexes = findNumbersMatchingPattern(recipe.radix, recipe.pattern, input.spicesNumber);
            const product = indexes.reduce((acc, index) => acc.times(input.spicesPrice[index]), bigInt(1));
            const z = product.add(recipe.c);
            const prime = primes.find(prime => z.mod(prime).value === 0);
            console.log(prime || -1);
        });
    }).catch((error) => {
        console.log('ERROR:', error);
        return -1;
    });
};

run().finally(() => {
    process.exit(0);
});