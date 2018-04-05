### Técnicas Avançadas de Programação  
Sistemas de Informação – 5 periodo  
Grupo 2  

**Integrantes**:  
Rhaylander Almeida

**Tema**: Força Bruta  
**Problema**: E. Mrs. Hudson's Pancakes  
**Dificuldade**: 10  
**Link**: [http://codeforces.com/problemset/problem/156/E](http://codeforces.com/problemset/problem/156/E)    

### Explicação do problema  

O problema gira em torno da produçaão de panquecas por Mrs. Hudson. O problema fala que ela aprendeu `m` novas receitas que são baseadas em `n` especiarias, que ficam na cozinha em jarras enumeradas de `0` a `n - 1`. Cada jarra possui o valor da especiaria em seu rótulo, um inteiro `a(i)`.

Sabe-se três valores para cada i-ésima receita: `d(i)`, `s(i)`, `c(i)`. `d(i)` e `c(i)` são inteiros, e `s(i)` representa o padrão de um inteiro escrito na base `d(i)`. O padrão possui números, letras (A-F para inteireos maior do que 9) e interrogaçōes (`?`). Um número `x` na base `d(i)` atende ao padrão `s(i)` se conseguirmos substituir cada `?` por uma letra ou número. O número `40A9875` (0040A9875) na base numérica `11` atende ao padrão `??4??987?`, e o número `4A9875` nao atende.

Para fazer uma i-ésima receita, Mrs. Hudson deve pegar todas as jarras com números da base `d(i)` que atendem ao padrão `s(i)`. O número de controle da receita (`z(i)`) é definida como a soma de `c(i)` e o produto dos preços de todas as jarras escolhidas. `z(i) = c(i) + (a(0) * a(1) * ... * a(j))`, onde `j` representa todos os números da base `d(i)` que atendem ao padrão `s(i)`.

**Entrada**:  
A primeira linha contém apenas um inteiro `n` (1 ≤ n ≤ 10 ^ 4).  
A segunda linha contém os preços das especiarias separados por espaços `a(0), a(1), ..., a(n - 1)`.  
A terceira linha contém apenas um inteiro `m` (1 ≤ a(i) ≤ 10 ^ 18).  
As próximas `m` linhas descrevem as receitas, uma por linha seguindo o seguinte formato `d(i) s(i) c(i)`. Especificações: 2 ≤ d(i) ≤ 16; s(i) possui números de "0" à "9", letras de "A" à  "F" e interrogaçōes (?); 1 ≤ c(i) ≤ 10 ^ 18.  

**Saida**:  
Para cada receita, procure o menor número primo pelo qual o nuúmero de controle é divisível, e imprima 1 resultado por linha. Se o número primo for maior que 100, imprima -1.

### Explicação da solução

Primeiro, fazemos o carregamento e validacao do input, e um array com todos os primos menores do que 100 é criado. A partir deste ponto, é hora de começar a processar as receitas. 

Para cara receita, nós procuramos por todos os números da base `d(i)` que atendem ao padrão `s(i)` e que seu valor seja menor que o número de especiarias (o número encontrado será utilizado para acessar o array de especiarias a fim de encontrar o produto de precos ao calcular o número de controle da receita). Esssa é a parte mais interessante do problema, encontrar todos os números que atendem ao padrão fornecido. Para isso, todos os simbolos `?` são substituidos por `(.)` com o objetivo de transformar o símbolo em uma RegExp. Após isso, nós percorremos um `for` a partir de `k = 0` até `k < spices.length`, transformamos `k` para a base `d(i)` e finalizamos o tratamento desse número por fazendo um `padLeft` com `0` a fim de igualar o número de caracteres do padrão `s(i)`. Agora, nós ja temos nossa RegExp pronta e o número na base `d(i)` tratado, só nos resta verificar se o número atende ao padrão, e se positivo, armazena-lo para o calculo do produto.

Possuindo todos os números armazenados em um array, só nos resta seguir a fórmula fornecida para calcular o número de controle e verificar se existe um divisor primo menor do que 100. Se existir, ele será impresso, caso contrário o número -1 será impresso.

### Solução

```javascript
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
```

### Casos de teste

Input
```
20
150 30 9 15 65 120 80 11 13 7 23 44 2 55 71 96 105 3 18 25
11
2 ?1??0 6
2 0??10 12
2 ?0?0? 35
2 00??1 17
2 ???11 68
2 ??1?0 19
8 ?7 5
4 0?1 4
3 ?2? 65
5 2? 7
2 0??00 56
```
Output
```
2
3
5
-1
17
11
-1
2
5
13
2
```

Input
```
5
505 13 7 156 125
3
2 ??1 154
2 1?? 36
2 ?1? 489
```
Output
```
2
7
3
```

Input
```
150
71 330 630 24 378 17 954 532 133 889 438 222 292 964 733 759 422 969 281 101 107 186 409 618 424 491 595 270 434 433 20 452 27 742 272 172 48 359 790 977 629 312 416 996 1000 599 970 795 811 774 224 211 586 666 522 919 594 891 844 712 721 478 450 397 490 499 102 595 827 669 195 940 710 42 880 336 40 145 334 585 212 610 438 598 394 716 955 710 592 621 330 159 278 810 931 549 963 19 910 475 603 695 944 649 739 588 99 985 398 311 47 758 377 354 547 748 223 798 320 306 834 588 502 135 784 759 152 897 647 457 250 181 653 275 829 501 476 224 86 542 632 82 707 326 334 909 550 701 513 559
4
16 ??A 52
11 ??0??1? 64
4 ??3? 13
3 1??1? 12
```
Output
```
53
2
13
2
```