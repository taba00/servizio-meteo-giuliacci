//-------------------------- DICHIARAZIONI GLOBALI --------------------------//
const express = require("express");
const app = express();


const logins = new Map();
logins.set('ta', {
  id: 1,
  salt: '123456',
  hash: 'aca2d6bd777ac00e4581911a87dcc8a11b5faf11e08f584513e380a01693ef38' //123456password
});




// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
