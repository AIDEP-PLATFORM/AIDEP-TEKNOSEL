.PHONY: help dev prod down logs migrate test seed clean
help:
	@echo "make dev | prod | down | logs | migrate | test | seed | clean"
dev:
	@[ -f docker/.env.dev ] || cp docker/.env.dev.example docker/.env.dev
	docker compose -f docker/docker-compose.dev.yml up --build
prod:
	docker compose -f docker/docker-compose.prod.yml up --build -d
down:
	docker compose -f docker/docker-compose.dev.yml down
logs:
	docker compose -f docker/docker-compose.dev.yml logs -f --tail=100
migrate:
	docker compose -f docker/docker-compose.dev.yml run --rm backend alembic upgrade head
test:
	docker compose -f docker/docker-compose.dev.yml exec backend pytest tests/ -v
seed:
	docker compose -f docker/docker-compose.dev.yml exec backend python app/data/seed_demo.py
clean:
	@read -p "Tüm veriler silinecek! ENTER..." _
	docker compose -f docker/docker-compose.dev.yml down -v --remove-orphans
