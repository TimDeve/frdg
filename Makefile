.DEFAULT_GOAL := build

.PHONY := build-client
build-client:
	cd client && npm run build

.PHONY := build-server
build-server:
	cd server && cargo build --release

.PHONY := build
build: build-client build-server

.PHONY := setup-hooks
setup-hooks:
	./scripts/setup-hooks
