// utils.js

const { v4: uuidv4 } = require('uuid');
const { Keypair } = require('stellar-sdk');

const WORDS = [
  'apple', 'banana', 'carrot', 'drum', 'echo', 'forest',
  'giant', 'honey', 'ice', 'jungle', 'kite', 'lemon'
];

function generateKeywordPair() {
  const word1 = WORDS[Math.floor(Math.random() * WORDS.length)];
  const word2 = WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${word1}-${word2}`;
}

async function generateEscrowKeypair() {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

module.exports = {
  generateKeywordPair,
  generateEscrowKeypair,
};
