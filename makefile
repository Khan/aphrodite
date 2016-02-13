all: dev dist

dev: 
	./node_modules/.bin/webpack

dist: 
	WEBPACK_ENV=dist ./node_modules/.bin/webpack

.PHONY: dist