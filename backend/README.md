# Backend API

This directory contains the Django API, database models, authentication, and business logic.

## API endpoints

- `POST /api/v1/auth/token/` — login with personnel number in `username` and password.
- `POST /api/v1/auth/token/refresh/` — refresh a JWT access token.
- `GET/PATCH /api/v1/accounts/users/me/` — current user profile.
- `GET/POST /api/v1/accounts/users/` — user management (admin only).
- `GET /api/v1/organizations/departments/` — department list.
- `POST/PATCH/DELETE /api/v1/organizations/departments/` — department management (admin only).

```powershell
pip install -r requirements.txt
python manage.py runserver
```

For the complete environment, run `docker compose up --build` from the workspace root.
