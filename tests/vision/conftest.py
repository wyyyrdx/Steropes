"""Pytest fixtures for vision tests."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest


@pytest.fixture
def utc_stamp() -> datetime:
    return datetime(2026, 9, 5, 3, 0, 0, tzinfo=timezone.utc)
