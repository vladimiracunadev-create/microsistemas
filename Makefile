# Makefile for Microsistemas

.PHONY: help install autoload refresh up down serve git-push

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
	git push origin master
