import {DataTypes, sequelize} from "../sequelize.js";
import Users from "./users.js";
import Annonces from "./annonces.js";
const Annonces_contacts = () => {
  const AnnoncesContactsModel = sequelize.define('annonces_contacts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_annonce: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'annonces',
        key: 'id'
      }
    },
    id_demandeur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    id_prestataire: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'annonces_contacts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "id_annonce",
        using: "BTREE",
        fields: [
          { name: "id_annonce" },
        ]
      },
      {
        name: "id_demandeur",
        using: "BTREE",
        fields: [
          { name: "id_demandeur" },
        ]
      },
      {
        name: "id_prestataire",
        using: "BTREE",
        fields: [
          { name: "id_prestataire" },
        ]
      },
    ]
  });
  AnnoncesContactsModel.belongsTo(Annonces, { foreignKey: 'id_annonce' });
  AnnoncesContactsModel.belongsTo(Users, { foreignKey: 'id_demandeur' });
  AnnoncesContactsModel.belongsTo(Users, { foreignKey: 'id_prestataire' });

  return AnnoncesContactsModel;
};

export default Annonces_contacts();
