const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    //ou stocker l'image(dossier image)
    callback(null, "images");
  },

  filename: (req, file, callback) => {
    // quel nom de fichier utiliser
    const name = file.originalname.split(" ").join("_"); // on remplace les espaces par des _
    const extension = MIME_TYPES[file.mimetype]; // on génére l'extension
    callback(null, name + Date.now() + "." + extension); // puis le nom de fichier final
  },
});

module.exports = multer({ storage: storage }).single("image");
