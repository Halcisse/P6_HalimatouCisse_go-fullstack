// importation du package
const passwordValidator = require("password-validator");

// Creation du schema
const passwordSchema = new passwordValidator();

// Ajout des propriétés
passwordSchema
  .is()
  .min(6) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values

module.exports = (req, res, next) => {
  const password = req.body.password;
  if (passwordSchema.validate(password)) {
    return next();
  } else {
    return res
      .status(400)
      .json({ error: passwordSchema.validate(password, { list: true }) });
  }
};
