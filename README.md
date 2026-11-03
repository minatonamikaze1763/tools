# NDC Tools frontend

Copy this directory into your separate `tools` repository. Deploy its contents as static files to `https://tools.nextdimensioncustoms.in`.

- index.html — page and tool interface
- style.css — responsive black/gold styles
- app.js — tools-only login, membership checks, file selection and downloads
- vendor/ — bundled PDF libraries and licenses

No build step. Keep all vendor files and logo.png. Backend origin is the API constant in app.js. Backend processing module is NOT included in the public repository: it is fetched from the protected /api/tools/engine.js route after server authentication.

Use your existing `username_admin` and password. Login, access, engine download and logout all use /api/tools routes. The session token is saved only in the current tab's sessionStorage; passwords are not stored.
