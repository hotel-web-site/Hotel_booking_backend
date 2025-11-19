# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

- Project: `Hotel_booking_backend` – intended as the “User Backend (Main API)” per `README.md`.
- Current state: the repository only contains `README.md` and `.gitignore`; backend source code, tooling, and configuration files have not been committed yet.

## Commands and tooling

There are currently no project configuration files (e.g. `package.json`, `pyproject.toml`, `.csproj`, `pom.xml`) or scripts in the repo, so there are **no canonical build, lint, or test commands defined yet**.

When additional tooling is added to this repository, do the following before running commands or editing code:

1. **Discover the primary build/test tooling**
   - List new files in the repo root and immediate subdirectories and look for common project files (for example: `package.json`, `pyproject.toml`, `requirements.txt`, `Pipfile`, `pom.xml`, `build.gradle`, `*.sln`, `*.csproj`, `Makefile`, `Dockerfile*`).
   - Once such files exist, prefer to use whatever scripts/targets they define rather than inventing new workflows.
2. **Surface core commands here**
   - After the first build/test/lint setup is committed, update this `WARP.md` with:
     - How to run the full test suite.
     - How to run a single test / focused test run.
     - How to build the project (if applicable).
     - How to start the development server or API locally.

If you are unsure which commands to use, inspect the newly added configuration files and/or ask the user rather than guessing.

## Architecture and structure

As of now there is **no backend implementation checked into this repository** (no source files or framework-specific configuration).

When application code is added, future Warp instances should:

- **Identify the main entrypoint and framework** used for the “User Backend (Main API)” by scanning the new source and configuration files.
- **Map high-level layers** (e.g. routing/controllers, domain/business logic, data access/persistence, configuration) across the new files and summarize them back into this section.
- **Note integration points** that are specific to this backend (e.g. external services, databases, authentication providers) once they are visible in the code, so that future edits respect those boundaries.

Until such code exists, treat this repository as a skeleton project and coordinate with the user before assuming any particular stack or architecture.