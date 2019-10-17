SSJ Doc Management
=================

This project was originally built with Glitch: https://glitch.com/edit/#!/messy-cart

## Development

Can be started locally using `npm start`

### Docker

App can also be run with docker-compose: `docker-compose up` 

## Production

The following exposes port 3000 and loads a local `.env` file:

```
docker build -t ssj-doc-manager .
docker run --env-file ./.env --name="ssj-doc-manager" -p 3000:3000 ssj-doc-manager
```

## Commit tagged release

```
git tag -a v`date -u "+%Y-%m-%d-%H-%M-%S"` -m ""
git push origin `git describe --abbrev=0`
```
