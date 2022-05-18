const Sauce = require("../models/sauces");
const auth = require("../middleware/auth");
const fs = require("fs"); // accéder au système de gestion des fichiers

// Pour afficher toutes les sauces = GET
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

// Pour afficher une seule sauce = GET
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

//Pour créer une sauce = POST
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject, // ... = spread : récupère toutes les infos du modèle dans le body de la req
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // on récupère l'url de l'image, protocol = http ou https, host = localhost
    usersLiked: [], // on initialise les tableaux vides
    usersDisliked: [],
    likes: 0,
    dislikes: 0,
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

//Pour modifier une sauce = PUT
exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        // si la sauce est non trouvé
        res.status(404).json({
          error: new Error("Cette sauce n'existe pas!"),
        });
      }
      if (req.file) {
        // s'il y a un fichier dans les éléments à modifier
        const filename = sauce.imageUrl.split("/images/")[1]; //on récupère le nom du fichier
        fs.unlink(`images/${filename}`, () => {
          //... on le supprime et on met à jour la sauce
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: "La sauce a été modifiée avec succès!!" })
            )
            .catch((error) => res.status(400).json({ error }));
        });
      } else if (!req.file) {
        // s'il n'y a pas de fichier dans les changements, on modife simplement
        const sauceObject = { ...req.body };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() =>
            res
              .status(200)
              .json({ message: "La sauce a été modifiée avec succès!!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//Pour supprimer une sauce = DELETE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        // si la sauce est non trouvé
        res.status(404).json({
          error: new Error("Cette sauce n'existe pas!"),
        });
      }
      const filename = sauce.imageUrl.split("/images/")[1]; // on recherche le nom du fichier image et on supprime le fichier
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id }) // puis on supprime la sauce
          .then(() =>
            res
              .status(200)
              .json({ message: "La sauce a été supprimée avec succès!!" })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Pour like/dislike une sauce = POST
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (
        // si le user like une sauce pour la première fois
        req.body.like === 1 &&
        !sauce.usersLiked.includes(req.body.userId) &&
        !sauce.usersDisliked.includes(req.body.userId)
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() =>
            res.status(201).json({ message: "Tu as liké cette sauce!" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (
        // s'il souhaite liker une sauce qu'il a déja liké
        req.body.like === 0 &&
        sauce.usersLiked.includes(req.body.userId)
      ) {
        Sauce.updateOne(
          {
            _id: req.params.id,
          },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() =>
            res
              .status(200)
              .json({ message: "Tu as changé d'avis sur cette sauce!" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (
        // si le user dislike une sauce pour la première fois
        req.body.like === -1 &&
        !sauce.usersLiked.includes(req.body.userId) &&
        !sauce.usersDisliked.includes(req.body.userId)
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() =>
            res
              .status(201)
              .json({ message: "Dommage, tu n'aimes pas cette sauce!" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (
        // s'il souhaite disliker une sauce qu'il a déja dislike
        req.body.like === 0 &&
        sauce.usersDisliked.includes(req.body.userId)
      ) {
        Sauce.updateOne(
          {
            _id: req.params.id,
          },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() =>
            res
              .status(200)
              .json({ message: "Tu as changé d'avis sur cette sauce!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
