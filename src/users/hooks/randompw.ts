import * as crypto from 'crypto';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SPECIALS = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

export function generatePassword(allowSpecial = false) {
  const minLength = allowSpecial ? 8 : 10;
  const pool = LETTERS + DIGITS + (allowSpecial ? SPECIALS : '');

  const pick = (str: string) => str[crypto.randomInt(0, str.length)];

  // đảm bảo chứa ít nhất 1 chữ, 1 số, và 1 special nếu có
  const required = [
    pick(LETTERS),
    pick(DIGITS),
    ...(allowSpecial ? [pick(SPECIALS)] : []),
  ];

  const remainingLength = minLength - required.length;
  for (let i = 0; i < remainingLength; i++) {
    required.push(pick(pool));
  }

  // trộn mảng (Fisher–Yates shuffle)
  for (let i = required.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}
