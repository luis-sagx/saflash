import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlacementQuestions, scorePlacement } from '../src/services/placementService.mjs';

function word(english_word, spanish_trans, category, difficulty) {
  return { english_word, spanish_trans, category, difficulty, frequency_rank: 1 };
}

const wordsByLevel = {
  A1: [
    word('hello', 'hola', 'greetings', 'A1'),
    word('bye', 'chau', 'greetings', 'A1'),
    word('please', 'por favor', 'greetings', 'A1'),
    word('thanks', 'gracias', 'greetings', 'A1'),
  ],
  A2: [
    word('shirt', 'camisa', 'clothing', 'A2'),
    word('pants', 'pantalón', 'clothing', 'A2'),
    word('coat', 'abrigo', 'clothing', 'A2'),
    word('shoe', 'zapato', 'clothing', 'A2'),
  ],
  B1: [
    word('airport', 'aeropuerto', 'travel', 'B1'),
    word('ticket', 'boleto', 'travel', 'B1'),
    word('luggage', 'equipaje', 'travel', 'B1'),
    word('flight', 'vuelo', 'travel', 'B1'),
  ],
  B2: [
    word('loan', 'préstamo', 'money_banking', 'B2'),
    word('debt', 'deuda', 'money_banking', 'B2'),
    word('savings', 'ahorros', 'money_banking', 'B2'),
    word('fee', 'cargo', 'money_banking', 'B2'),
  ],
  C1: [
    word('lawsuit', 'demanda', 'law_government', 'C1'),
    word('verdict', 'veredicto', 'law_government', 'C1'),
    word('statute', 'estatuto', 'law_government', 'C1'),
    word('plaintiff', 'demandante', 'law_government', 'C1'),
  ],
};

test('builds two placement questions per level with four options', () => {
  const questions = buildPlacementQuestions(wordsByLevel);

  assert.equal(questions.length, 10);
  assert.equal(questions.filter(q => q.level === 'A1').length, 2);
  assert.equal(questions[0].options.length, 4);
  assert.ok(questions[0].options.includes(questions[0].answer));
});

test('scores the highest contiguous level with at least one correct answer', () => {
  const answers = {
    A1: [true, false],
    A2: [true, false],
    B1: [false, false],
    B2: [true, true],
    C1: [true, true],
  };

  assert.equal(scorePlacement(answers), 'A2');
});

test('scores A1 when there are no correct answers', () => {
  assert.equal(scorePlacement({ A1: [false, false], A2: [false, false] }), 'A1');
});
