SHELL := /bin/bash
ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

.PHONY: dev install backend frontend

dev: install
	@if ! curl -s http://localhost:11434 > /dev/null 2>&1; then \
		echo "  Starting Ollama..."; \
		ollama serve &> /tmp/ollama.log & \
		sleep 2; \
	fi
	@if ! ollama list | grep -q "mistral:7b"; then \
		echo ""; \
		echo "  ⚠  mistral:7b is not pulled. Run:"; \
		echo "     ollama pull mistral:7b"; \
		echo ""; \
		exit 1; \
	fi
	@trap 'kill %1 %2 %3 2>/dev/null' INT TERM; \
	cd $(ROOT)backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload & \
	cd $(ROOT)frontend && npm run dev & \
	echo ""; \
	echo "  Presentation Coach running:"; \
	echo "  Frontend → http://localhost:5173"; \
	echo "  Backend  → http://localhost:8000"; \
	echo ""; \
	echo "  Press Ctrl+C to stop."; \
	wait

install:
	@cd $(ROOT)backend && python3 -m venv venv && source venv/bin/activate && pip install -q -r requirements.txt
	@cd $(ROOT)frontend && npm install --silent

backend:
	cd $(ROOT)backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd $(ROOT)frontend && npm run dev
