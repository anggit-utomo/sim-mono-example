// Shared curl used by EN + ID walkthrough pages (single source so both stay identical).
export const CURL = `curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990001","name":"Ada","email":"ada@example.com"}'`;
