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

// import * as crypto from 'crypto';

// interface GeneratePasswordOptions {
//   userId?: string;        // ID không được xuất hiện trong mật khẩu
//   allowSpecial?: boolean; // true => có special chars (min length = 8)
//   minLength?: number;     // ghi đè độ dài tối thiểu
//   maxAttempts?: number;   // số lần thử lại khi trùng userId
// }

// const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// const DIGITS = '0123456789';
// const SPECIALS = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

// export function generatePassword(options: GeneratePasswordOptions = {}): string {
//   const {
//     userId = '',
//     allowSpecial = false,
//     minLength,
//     maxAttempts = 20,
//   } = options;

//   const effectiveMin = minLength ?? (allowSpecial ? 8 : 10);
//   const basePool = LETTERS + DIGITS + (allowSpecial ? SPECIALS : '');

//   const pick = (pool: string) => {
//     const idx = crypto.randomInt(0, pool.length);
//     return pool[idx];
//   };

//   const containsUserId = (pwd: string) =>
//     userId && pwd.toLowerCase().includes(userId.toLowerCase());

//   for (let attempt = 0; attempt < maxAttempts; attempt++) {
//     // Bắt buộc có ít nhất 1 chữ + 1 số (+ 1 special nếu cho phép)
//     const requiredChars: string[] = [
//       pick(LETTERS),
//       pick(DIGITS),
//       ...(allowSpecial ? [pick(SPECIALS)] : []),
//     ];

//     const totalLength = Math.max(effectiveMin, requiredChars.length);
//     const remaining = totalLength - requiredChars.length;

//     const chars = [...requiredChars];
//     for (let i = 0; i < remaining; i++) {
//       chars.push(pick(basePool));
//     }

//     // Trộn mảng (Fisher–Yates)
//     for (let i = chars.length - 1; i > 0; i--) {
//       const j = crypto.randomInt(0, i + 1);
//       [chars[i], chars[j]] = [chars[j], chars[i]];
//     }

//     const password = chars.join('');

//     if (!containsUserId(password)) {
//       return password;
//     }
//   }

//   throw new Error(
//     `Không thể sinh mật khẩu hợp lệ sau ${maxAttempts} lần thử.`,
//   );
// }

// import * as crypto from 'crypto';

// interface GeneratePasswordOptions {
//   id?: number; // ID dạng số
//   allowSpecial?: boolean; // true => có special chars (min length = 8)
//   minLength?: number; // ghi đè độ dài tối thiểu
//   maxAttempts?: number; // số lần thử lại khi trùng userId
// }

// const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// const DIGITS = '0123456789';
// const SPECIALS = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

// export function generatePassword(
//   options: GeneratePasswordOptions = {},
// ): string {
//   const { id, allowSpecial = false, minLength, maxAttempts = 20 } = options;

//   const userIdStr = id?.toString() ?? '';
//   const effectiveMin = minLength ?? (allowSpecial ? 8 : 10);
//   const basePool = LETTERS + DIGITS + (allowSpecial ? SPECIALS : '');

//   const pick = (pool: string) => pool[crypto.randomInt(0, pool.length)];
//   const containsUserId = (pwd: string) =>
//     userIdStr && pwd.toLowerCase().includes(userIdStr.toLowerCase());

//   for (let attempt = 0; attempt < maxAttempts; attempt++) {
//     // bắt buộc có ít nhất 1 chữ + 1 số (+ 1 special nếu cho phép)
//     const requiredChars: string[] = [
//       pick(LETTERS),
//       pick(DIGITS),
//       ...(allowSpecial ? [pick(SPECIALS)] : []),
//     ];

//     const totalLength = Math.max(effectiveMin, requiredChars.length);
//     const remaining = totalLength - requiredChars.length;

//     const chars = [...requiredChars];
//     for (let i = 0; i < remaining; i++) {
//       chars.push(pick(basePool));
//     }

//     // Trộn mảng (Fisher–Yates)
//     for (let i = chars.length - 1; i > 0; i--) {
//       const j = crypto.randomInt(0, i + 1);
//       [chars[i], chars[j]] = [chars[j], chars[i]];
//     }

//     const password = chars.join('');
//     if (!containsUserId(password)) {
//       return password;
//     }
//   }

//   throw new Error(`Không thể sinh mật khẩu hợp lệ sau ${maxAttempts} lần thử.`);
// }
