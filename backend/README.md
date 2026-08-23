# Backend API

This directory contains the Django API, database models, authentication, and business logic.

## API endpoints

- `POST /api/v1/auth/token/` — login with personnel number in `username` and password.
- `POST /api/v1/auth/token/refresh/` — refresh a JWT access token.
- `GET/PATCH /api/v1/accounts/users/me/` — current user profile.
- `GET/POST /api/v1/accounts/users/` — user management (admin only).
- `GET /api/v1/organizations/departments/` — department list.
- `POST/PATCH/DELETE /api/v1/organizations/departments/` — department management (admin only).
- `GET/POST /api/v1/projects/` — all users can view; system administrators and Project Managers can create.
- `GET/POST /api/v1/project-memberships/` — project-role assignments; project manager only for changes.
- `GET/POST /api/v1/tasks/` — all users can view; project manager manages task details.
- `POST /api/v1/tasks/:id/submit-progress/` — project lead submits task progress.
- `POST /api/v1/tasks/:id/review-progress/` — project observer approves or rejects progress.
- `POST /api/v1/time-entries/clock-in/` and `POST /api/v1/time-entries/:id/clock-out/` — time logging for project members.

```powershell
pip install -r requirements.txt
python manage.py runserver
```

For the complete environment, run `docker compose up --build` from the workspace root.
