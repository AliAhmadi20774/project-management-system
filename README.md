# Project Management System

This workspace separates the project into two applications inside one GitHub repository.

| Application | Path | Stack | Development URL |
| --- | --- | --- | --- |
| API | `backend/` | Django + PostgreSQL | `http://localhost:8000` |
| UI | `frontend/` | Next.js / OrbynAdmin | `http://localhost:3000` |

`backend/` contains API, authentication, database models, and business rules. `frontend/` contains the dashboard UI, including pages, UX flows, and reusable UI components.

## Run the complete environment

```powershell
docker compose up --build
```

## Publish the complete project to GitHub

The API and UI are published together from the workspace root.

```powershell
git add -A
git commit -m "Add project API and OrbynAdmin UI"
git push -u origin main
git push -u origin main
```

The current repository remote is your GitHub repository. OrbynAdmin's upstream remote has been removed.
