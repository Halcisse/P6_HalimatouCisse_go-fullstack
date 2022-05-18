// IMPORTATION DES packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// on definis les routes user et sauces
const usersRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

//Connexion à la base de donnée avec Mongoose
mongoose
  .connect(
    "mongodb+srv://HalimaOcPiquante:QMG9XTwH3NQXaqjE@halimatoucisse.tgmrw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// permet de gérer les erreurs de connexion sur plusieurs serveurs (CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * doit être remplacé par le port du frontend pour passage en prod
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS" // les actions autorisées
  );
  next();
});

app.use(express.json()); // les requetes entrantes sont parsés en json

// on definis les routes vers les dossiers "routes"
app.use("/api/auth", usersRoutes);
app.use("/api/sauces", saucesRoutes);
app.use("/images", express.static(path.join(__dirname, "images"))); //dirname est la route absolue vers le dossier images

module.exports = app;
