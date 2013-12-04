# Hoe sociaal zijn kerken in Nederland?

Zie `data/nl-churches.json` voor de lijst met kerknamen, twitter-screennames en facebook-pagina's.
In `data/nl-churches-with-metrics` vind je diezelfde lijst, maar nu met onderandere het aantal volgers, tweets, likes.

Naar idee en vraag van <a href="https://twitter.com/creatov">@creatov</a>: http://www.creatov.nl/kerken-op-sociale-media/

## Kerken toevoegen

Je kunt zelf een record toevoegen in `data/nl-churches.json`, maar handiger is het formulier gebruiken op http://jieter.github.io/NL-social-churches/ onder het tabje 'over'.

## Zelf metrics updaten.

Allereerst heb je [Node.js](http://nodejs.org/) nodig.

Vervolgens een twitter api-key, zet die in `social-churches/twitter-api-auth.js` als volgt:
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
$ node index.js
Load churches from [...]NL-social-church/data/nl-churches.json
Cleaned up [...]NL-social-church/data/nl-churches.json

Wrote 98 churches to [...]NL-social-church/data/nl-churches-with-metrics.json
```

Twitter limiteert het aantal aanvragen tot 180 per 15 minuten, maar aanvragen worden gecached in `social-church/__twitter-cache.json`, na twee uur wordt alles weer opnieuw geladen. Als het aantal kerken dus onder de 180 blijft zou het herhaaldelijk aanroepen van het script dus ook geen probleem moeten opleveren.
