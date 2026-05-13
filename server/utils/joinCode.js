// Excludes 0/O and 1/I to keep codes unambiguous when read aloud or typed.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Generates a join code that doesn't already exist in the given collection.
 * Retries on collision; throws after `maxAttempts` failures.
 */
async function generateUniqueJoinCode(Model, field = 'joinCode', length = 6, maxAttempts = 8) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = makeCode(length);
    const exists = await Model.exists({ [field]: candidate });
    if (!exists) return candidate;
  }
  throw new Error(`Failed to generate a unique ${field} after ${maxAttempts} attempts`);
}

module.exports = { makeCode, generateUniqueJoinCode };
