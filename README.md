# ModHub Admin Starter

This version adds a real server-side admin login. It is not a password hidden in frontend JavaScript.

## Run on a PC/server
1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Set `ADMIN_PASSWORD` to your own strong password.
4. Set `SESSION_SECRET` to a long random secret (32+ characters).
5. Install dependencies:
   `npm install`
6. Start:
   `npm start`
7. Open:
   `http://localhost:3000`
8. Admin:
   `http://localhost:3000/admin.html`

## Important
The .env file is intentionally not included. Never publish it or commit it to GitHub.
For production, use HTTPS and a production session store instead of the default in-memory session store.

The dashboard lets the admin add, edit and delete catalog listings. The download field should only point to files/URLs you are legally allowed to distribute.

This starter does not automatically create or distribute copyrighted/modded APKs.