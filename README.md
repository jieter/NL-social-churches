# Hoe sociaal zijn kerken in Nederland?


Zie `nl-churches.json` voor de lijst met kerken, twitter-screennames en facebook-pagina's.
In `nl-churches-with-metrics` vind je diezelfde lijst, maar nu met onderandere het aantal volgers, tweets, likes.

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