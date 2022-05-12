const Sauce = require("../models/sauces");

// Pour afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find() // find affiche toutes les sauces
    .then((sauces) => {
      res.status(200).json(sauces); // toujours envoyer un réponse ds le then pour eviter expiration de la req
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Pour afficher une seule sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    // affiche la sauce correspondant à l'id
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

//Pour créer une sauce
exports.createSauce = (req, res, next) => {
  const sauce = new Sauce({
    ...req.body, // ... = spread : récupère toutes les infos du modèle dans le body de la req
  });
  sauce
    .save() // save enregistre l'objet crée dans la bdd
    .then(() => {
      res.status(201).json({
        message: "Sauce ajoutée avec succès!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

//Pour modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauce = new Sauce({
    ...req.body,
  });
  Sauce.updateOne({ _id: req.params.id }, sauce) // arg 1 = objet de comparaison, arg 2 = nouvel objet
    .then(() => {
      res.status(201).json({
        message: "Sauce modifiée avec succès!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// const auth = require("../middleware/auth");

//Pour supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      // si la sauce est non trouvé
      res.status(404).json({
        error: new Error("Cette sauce n'existe pas!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      // Si l'id de l'utilisateur est diff de l'id de la personne ayant crée la sauce
      res.status(400).json({
        error: new Error("Accès non autorisé!"),
      });
    }
    Sauce.deleteOne({ _id: req.params.id }) // ...SINON
      .then(() => {
        res.status(200).json({
          message: "La sauce a été supprimée avec succès!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
};

//Pour like/dislike une sauce ***
