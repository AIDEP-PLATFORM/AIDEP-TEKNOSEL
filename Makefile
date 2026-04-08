.PHONY: help dev down logs migrate test seed clean

help:
	@echo "make dev | down | logs | migrate | test | seed | clean"

dev:
	@[ -f .env ] || cp .env.example .env
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

migrate:
	docker compose run --rm backend alembic upgrade head

test:
	docker compose exec backend pytest tests/ -v

seed:
	docker compose exec backend python app/data/seed_demo.py

clean:
	@read -p "Tüm veriler silinecek! ENTER..." _
	docker compose down -v --remove-orphans
