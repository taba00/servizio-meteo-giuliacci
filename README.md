# Servizio Meteo "Giuliacci"
## Realizzata da
![logo_uni](https://cdn.glitch.com/a7534710-3f80-4858-a492-a3c69bf1b400%2Flogo_sti.png?v=1624532887636)
<br> Lorenzo Tabarrini <br>
Matricola n° *301996*

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
L'endpoint del servizio è il seguente: `https://servizio-meteo-giuliacci.glitch.me/`
<br><br>
Autenticazione:
## POST [login](https://servizio-meteo-giuliacci.glitch.me/meteo/login)
Per effettuare l'autenticazione al servizio, è necessario essere registrati nel sistema. <br>L'autenticazione avviene tramite la *Basic Auth*.

## Lista dettagliata API Restful con relativa documentazione
## POST [meteo](https://servizio-meteo-giuliacci.glitch.me/meteo) 
Rappresenta in formato JSON tutte le citta con i relativi dati meteo presenti nel servizio.
<br><br>Il metodo non ha parametri da fornire al momento della richiesta HTTP.
## GET [meteoCitta](https://servizio-meteo-giuliacci.glitch.me/meteo/meteoCitta)
Rappresenta in formato JSON la città richiesta tramite identificativo.
Campo | Tipo | Descrizione | Obbligatorio
--- | --- | --- | --- 
`id` | integer | id della città di cui si vogliono sapere i dati meteo | Si
## GET [aggiungiCitta](https://servizio-meteo-giuliacci.glitch.me/meteo/aggiungiCitta)
Rappresenta il metodo per aggiungere una nuova città al servizio. <br><br>La richiesta può essere effettuata
solo dall'amministratore del servizio (in questo caso l'utente "gestore").<br><br>Nel body della richesta HTTP, il metodo accetta solo 
il tipo di contenuto `application/json` nel seguente formato:<br>
```json
{
   "citta":"nomeCitta",
   "temperatura":{
      "numero": "temperatura",
      "UM": "unitaDiMisura"
   },
   "fenomeniAtmosferici":"tipoDiFenomenoAtmosferico",
   "umidita":{
      "numero":"umidita",
      "UM":"unitaDiMisura"
   }
}
```
## DELETE [eliminaCitta](https://servizio-meteo-giuliacci.glitch.me/meteo/eliminaCitta)
Elimina i dati meteo di una certa città tramite l'identificativo.
Campo | Tipo | Descrizione | Obbligatorio
--- | --- | --- | --- 
`id` | integer | id della città di cui si vogliono eliminare i dati meteo | Si
## POST [modificaDato](https://servizio-meteo-giuliacci.glitch.me/meteo/modificaDato)
Modifica un certo tipo di dato metereologico.
Campo | Tipo | Descrizione | Obbligatorio
--- | --- | --- | --- 
`id` | integer | id della città di cui si vogliono modificare i dati meteo | Si
`campo` | string | nome del campo che si vuole modificare (Vedi la [struttura di Campo](https://github.com/taba00/servizio-meteo-giuliacci#campo)) | Si 
`nuovoValore` | integer, string | nuovo valore da assegnare al campo indicato precedentemente | Si
## Campo
Sigla | Campo
| --- | --- 
`c` | citta 
`tn` | temperatura => numero
`tum` | temperatura => UM
`fa` | fenomeniAtmosferici
`un` | umidita => numero
`uum` | umidita => UM
## Descrizione delle modalità della messa online del servizio
La messa online del servizio è stata possibile tramite l'applicativo online [Glitch](https://glitch.com/). 
## Esempio descrittivo di utilizzo del servizio Web
Alcuni esempi effettuati con il client [Postman](https://www.postman.com/)<br><br>
Autenticazione:<br>
![login](https://cdn.glitch.com/a7534710-3f80-4858-a492-a3c69bf1b400%2Flogin.PNG?v=1624556674161)
<br>
Aggiunta della città con i relativi dati metereologici:<br>
![aggiungiCitta](https://cdn.glitch.com/a7534710-3f80-4858-a492-a3c69bf1b400%2Faggiungi.PNG?v=1624556669320)
<br>
Eliminazione di una città tramite l'identificativo della città:<br>
![eliminaCitta](https://cdn.glitch.com/a7534710-3f80-4858-a492-a3c69bf1b400%2Felimina.PNG?v=1624556671069)
<br><br><br>

