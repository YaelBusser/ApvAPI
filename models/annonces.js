import {DataTypes, sequelize} from "../sequelize.js";
import {Model as Annonce} from "sequelize";
import TypesAnnonce from "./types_annonce.js";
import Categories from "./categories.js";
import Users from "./users.js";
const Annonces = () => {
  const AnnoncesModel = sequelize.define('annonces', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    id_categorie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    id_type_annonce: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'types_annonce',
        key: 'id'
      }
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'annonces',
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
        name: "id_categorie",
        using: "BTREE",
        fields: [
          { name: "id_categorie" },
        ]
      },
      {
        name: "id_user",
        using: "BTREE",
        fields: [
          { name: "id_user" },
        ]
      },
      {
        name: "id_type_annonce",
        using: "BTREE",
        fields: [
          { name: "id_type_annonce" },
        ]
      },
    ]
  });
  AnnoncesModel.belongsTo(Categories, { foreignKey: 'id_categorie' });
  AnnoncesModel.belongsTo(Users, { foreignKey: 'id_user' });
  AnnoncesModel.belongsTo(TypesAnnonce, { foreignKey: 'id_type_annonce' });

  return AnnoncesModel;
};
export default Annonces();