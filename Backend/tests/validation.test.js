const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRegistrationPayload,
  validateProfileUpdatePayload
} = require('../utils/validation');

test('rejects invalid email addresses such as we@f.v', () => {
  assert.equal(validateEmail('we@f.v'), false);
  assert.equal(validateEmail('name@example.com'), true);
});

test('requires stronger passwords', () => {
  assert.equal(validatePassword('weakpass'), false);
  assert.equal(validatePassword('StrongPass1'), true);
});

test('rejects empty or invalid email values', () => {
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('   '), false);
  assert.equal(validateEmail('invalid-email'), false);
});

test('validates registration payload fields', () => {
  const result = validateRegistrationPayload({
    name: 'A',
    email: 'bad-email',
    password: 'weak',
    confirmPassword: 'different',
    phone: '123',
    gender: '',
    role: 'tourist',
    nationality: 'local',
    nic: 'abc'
  }, 'tourist');

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((error) => error.field === 'name'));
  assert.ok(result.errors.some((error) => error.field === 'email'));
  assert.ok(result.errors.some((error) => error.field === 'password'));
  assert.ok(result.errors.some((error) => error.field === 'confirmPassword'));
  assert.ok(result.errors.some((error) => error.field === 'phone'));
  assert.ok(result.errors.some((error) => error.field === 'gender'));
  assert.ok(result.errors.some((error) => error.field === 'nic'));
});

test('validates profile updates', () => {
  const result = validateProfileUpdatePayload({
    name: 'A',
    phone: 'bad',
    gender: 'unknown',
    languages: ''
  }, 'tourist');

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((error) => error.field === 'name'));
  assert.ok(result.errors.some((error) => error.field === 'phone'));
  assert.ok(result.errors.some((error) => error.field === 'gender'));
});

test('accepts valid phone numbers', () => {
  assert.equal(validatePhone('+94771234567'), true);
  assert.equal(validatePhone('0771234567'), true);
});
