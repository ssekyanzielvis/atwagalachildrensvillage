// Utility script to generate password hash
// Run this in browser console or Node.js to get correct hash

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate hash for "admin123"
hashPassword('admin123').then(hash => {
  console.log('Password hash for "admin123":', hash);
});

// Expected output:
// 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
