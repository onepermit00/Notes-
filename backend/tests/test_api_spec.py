"""docs/api must match the code: every endpoint documented, and the files up to date.

If this fails, run `python scripts/build_api_spec.py` in backend/ (after adding any
new endpoint to META in that script) and commit the regenerated docs/api files.
Needs no database: `pytest --noconftest tests/test_api_spec.py` runs it on its own.
"""
import sys
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND / 'scripts'))
yaml = pytest.importorskip('yaml')

import build_api_spec  # noqa: E402


def test_every_endpoint_is_documented_and_docs_are_current():
    spec = build_api_spec.build()  # raises SystemExit naming any endpoint missing from META
    saved = yaml.safe_load((build_api_spec.DOCS / 'openapi.yaml').read_text())
    assert saved == spec, 'docs/api/openapi.yaml is out of date: run python scripts/build_api_spec.py'
    assert (build_api_spec.DOCS / 'API.md').read_text() == build_api_spec.to_markdown(spec), \
        'docs/api/API.md is out of date: run python scripts/build_api_spec.py'
