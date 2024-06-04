var DataTypes = require("sequelize").DataTypes;
var _annonces = require("./annonces");
var _annonces_contacts = require("./annonces_contacts");
var _categories = require("./categories");
var _messages = require("./messages");
var _types_annonce = require("./types_annonce");
var _users = require("./users");

function initModels(sequelize) {
  var annonces = _annonces(sequelize, DataTypes);
  var annonces_contacts = _annonces_contacts(sequelize, DataTypes);
  var categories = _categories(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var types_annonce = _types_annonce(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  annonces_contacts.belongsTo(annonces, { as: "id_annonce_annonce", foreignKey: "id_annonce"});
  annonces.hasMany(annonces_contacts, { as: "annonces_contacts", foreignKey: "id_annonce"});
  messages.belongsTo(annonces_contacts, { as: "id_annonces_contacts_annonces_contact", foreignKey: "id_annonces_contacts"});
  annonces_contacts.hasMany(messages, { as: "messages", foreignKey: "id_annonces_contacts"});
  annonces.belongsTo(categories, { as: "id_categorie_category", foreignKey: "id_categorie"});
  categories.hasMany(annonces, { as: "annonces", foreignKey: "id_categorie"});
  annonces.belongsTo(types_annonce, { as: "id_type_annonce_types_annonce", foreignKey: "id_type_annonce"});
  types_annonce.hasMany(annonces, { as: "annonces", foreignKey: "id_type_annonce"});
  annonces.belongsTo(users, { as: "id_user_user", foreignKey: "id_user"});
  users.hasMany(annonces, { as: "annonces", foreignKey: "id_user"});
  annonces_contacts.belongsTo(users, { as: "id_demandeur_user", foreignKey: "id_demandeur"});
  users.hasMany(annonces_contacts, { as: "annonces_contacts", foreignKey: "id_demandeur"});
  annonces_contacts.belongsTo(users, { as: "id_prestataire_user", foreignKey: "id_prestataire"});
  users.hasMany(annonces_contacts, { as: "id_prestataire_annonces_contacts", foreignKey: "id_prestataire"});
  messages.belongsTo(users, { as: "id_sender_user", foreignKey: "id_sender"});
  users.hasMany(messages, { as: "messages", foreignKey: "id_sender"});

  return {
    annonces,
    annonces_contacts,
    categories,
    messages,
    types_annonce,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
