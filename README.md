# Realizzata da

Lorenzo Tabarrini <br>
Matricola n° 301996


# Servizio Meteo "Giuliacci"

## Descrizione del servizio implementato e del suo scopo

Il servizio meteo è stato sviluppato per fornire alcuni dati meteo di diverse città italiane.<br> I dati vengono caricati dal "gestore" e possono
essere richiesti all' API Restful anche da un "utente" generico. <br>Lo scopo del servizio è quello di fornire i dati meteo al client.

## Descrizione di architettura e scelte implementative

Il linguaggio di programmazione utilizzato si basa su Express di Node JS.<br>Il servzio, rispetta tutte le caratteristiche delle API Restful.
<br>Per quanto riguarda l'autenticazione del client, si è deciso di utilizzare il JWT (JSON Web Token). <br>Le librerie utilizzate sono molteplici:<br>
<ul>
  <li><b>cookie-parser</b> - E' stata utilizzata per usufruire dei cookie in fase di autenticazione.</li>
  <li><b>js-sha256</b> - E' stata utilizzata per criptare le password tramite l'algoritmo SHA 256.</li> 
  <li><b>njwt</b> - E' stata utilizzata per generare il JSON Web Token e firmare tutta la chiave.</li>
</ul>

## Documentazione dell’API implementata
ttempt | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 | #11
--- | --- | --- | --- |--- |--- |--- |--- |--- |--- |--- |---
Seconds | 301 | 283 | 290 | 286 | 289 | 285 | 287 | 287 | 272 | 276 | 269

## Descrizione delle modalità della messa online del servizio
La messa online del servizio è stata possibile tramite l'applicativo online <a href="https://glitch.com/">Glitch</a> . 

## Esempio descrittivo di utilizzo del servizio Web

