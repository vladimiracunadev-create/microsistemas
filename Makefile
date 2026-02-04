# Makefile for Microsistemas

.PHONY: help install autoload refresh up down serve git-push hub-list hub-run hub-up hub-doctor k8s-apply

# Default target
help:
	@echo "Microsistemas Manage Tool"
	@echo "Usage:"
	@echo "  make install    Install PHP dependencies"
	@echo "  make autoload   Dump Composer autoloader"
	@echo "  make refresh    Clean vendor folder and reinstall"
	@echo "  make up         Start Docker containers (if docker-compose exists)"
	@echo "  make down       Stop Docker containers"
	@echo "  make serve      Start built-in PHP server (localhost:8000)"
	@echo "  make git-push   Add, commit and push changes (Usage: make git-push MSG='Your message')"
	@echo ""
	@echo "Hub CLI Commands:"
	@echo "  make hub-list     List all apps"
	@echo "  make hub-run APP=x Run an app localy (e.g. make hub-run APP=Conversor)"
	@echo "  make hub-up APP=x  Up an app with Docker Compose"
	@echo "  make hub-doctor   Check system health"
	@echo ""
	@echo "Kubernetes Commands:"
	@echo "  make k8s-apply APP=x Apply K8s manifest for an app"

install:
	composer install

autoload:
	composer dump-autoload -o

refresh:
	rm -rf vendor
	composer install

up:
	docker-compose up -d || echo "docker-compose up failed, check your config"

down:
	docker-compose down

serve:
	php -S localhost:8000 -t .

git-push:
	git add .
	git commit -m "$(MSG)"
	git push origin main

ifeq ($(OS),Windows_NT)
    HUB_CLI := powershell -ExecutionPolicy Bypass -File .\hub.ps1
else
    HUB_CLI := ./hub.sh
endif

hub-list:
	$(HUB_CLI) list

hub-run:
	$(HUB_CLI) run $(APP)

hub-up:
	$(HUB_CLI) up $(APP)

hub-doctor:
	$(HUB_CLI) doctor

k8s-apply:
	kubectl apply -k k8s/demo/
