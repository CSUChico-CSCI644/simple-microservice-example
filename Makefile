BASE_URL ?= http://localhost:8080
PYTHON ?= python3

.PHONY: test-e2e
test-e2e:
	$(PYTHON) tests/e2e.py "$(BASE_URL)"
