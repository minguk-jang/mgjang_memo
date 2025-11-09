#!/usr/bin/env bash
# exit on error
set -o errexit

# Install uv if not present
pip install uv

# Install dependencies with uv
uv pip install --system -r requirements.txt

# Run database migrations if using Alembic
# alembic upgrade head
