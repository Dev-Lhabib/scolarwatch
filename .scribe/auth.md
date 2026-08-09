# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer {YOUR_AUTH_KEY}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Tous les endpoints (sauf <code>POST /api/login</code> et <code>GET /api/health</code>) exigent un jeton Sanctum. Obtenez-le en appelant <code>POST /api/login</code> puis transmettez-le dans l'en-tête <code>Authorization: Bearer &lt;token&gt;</code>.
