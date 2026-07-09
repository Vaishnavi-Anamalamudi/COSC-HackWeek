import fizzBuzz from './FizzBuzz.nova?raw';
import factorial from './Factorial.nova?raw';
import prime from './Prime.nova?raw';
import palindrome from './Palindrome.nova?raw';
import fibonacci from './Fibonacci.nova?raw';
import calculator from './Calculator.nova?raw';

export const examples = [
  { id: 'fizzbuzz', name: 'FizzBuzz', description: 'Loops, conditions, modulo', source: fizzBuzz },
  { id: 'factorial', name: 'Factorial', description: 'Recursive function return', source: factorial },
  { id: 'prime', name: 'Prime Numbers', description: 'Arrays and while loops', source: prime },
  { id: 'palindrome', name: 'Palindrome', description: 'Strings and indexing', source: palindrome },
  { id: 'fibonacci', name: 'Fibonacci', description: 'Recursion and arrays', source: fibonacci },
  { id: 'calculator', name: 'Calculator', description: 'Functions and math builtins', source: calculator }
];
