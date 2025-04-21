
import json
import pytest
from app import app, model

class Dummy:
    def __init__(self, text): self.text = text

@pytest.fixture(autouse=True)
def mock_genai(monkeypatch):
    sample = json.dumps({"case_note":"n","care_plan":{"goals":[],"gaps":[],"interventions":[]},"action_items":[]})
    monkeypatch.setattr(model, "generate_content", lambda prompt: Dummy(sample))

@pytest.fixture
def client():
    return app.test_client()

def test_generate(client):
    rv = client.post("/generate", json={"discharge_summary":"test"})
    assert rv.status_code == 200
    data = rv.get_json()
    assert "case_note" in data
