// Load repo-root .env so API_URL/ADMIN_TOKEN are set for server components
// (turbo runs each app with its own cwd; Next only auto-loads local .env files).
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
