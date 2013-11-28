# Hoe sociaal zijn kerken in Nederland?

Zie `nl-churches.json` voor de lijst met kerknamen, twitter-screennames en facebook-pagina's.
In `nl-churches-with-metrics` vind je diezelfde lijst, maar nu met onderandere het aantal volgers, tweets, likes.

Naar idee en vraag van <a href="https://twitter.com/creatov">@creatov</a>: http://www.creatov.nl/kerken-op-sociale-media/

## Kerken toevoegen

Maak voor elke kerk een nieuwe record aan in nl-churches.json
```
{
	"name": "Naam van de kerk",
	"facebook_url": "https://www.facebook.com/...",
	"twitter"_name": "@...",
	"website": "http://..."
}
```

## Metrics updaten.

Allereerst heb je [Node.js](http://nodejs.org/) nodig.

Vervolgens een twitter api-key, zet die in `apis/twitter-api-auth.js` als volgt:
```JavaScript
module.exports = {
    consumer_key:         '',
    consumer_secret:      '',
    access_token:         '',
    access_token_secret:  ''
};
```

Vervolgens installeer je alle dependencies:

```
npm install
```

en kan je de boel updaten met

```
node index.js
```

Als je geen foutmelding krijgt zijn twitter/facebook-metrics geüpdateted.

Twitter limiteert het aantal aanvragen tot 180 per 15 minuten.
