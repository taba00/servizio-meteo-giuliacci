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
L'endpoint del servizio è il seguente: <code>[https://meteo-tabarrini-lorenzo.glitch.me/](https://meteo-tabarrini-lorenzo.glitch.me/)</code>
<br><br>
Autenticazione:
### Login
Per effettuare l'autenticazione al servizio, è necessario essere registrati nel sistema. <br>L'autenticazione avviene tramite la <b>Basic Auth</b>.

## Lista dettagliata API Restful con relativa documentazione
Campo | Tipo | Descrizione
--- | --- | --- 
nome campo | 301 | 283 

## Descrizione delle modalità della messa online del servizio
La messa online del servizio è stata possibile tramite l'applicativo online <a href="https://glitch.com/">Glitch</a> . 

## Esempio descrittivo di utilizzo del servizio Web

