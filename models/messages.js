import {DataTypes, sequelize} from "../sequelize.js";
import Users from "./users.js";
import Annonces_contacts from "./annonces_contacts.js";
import {Sequelize} from "sequelize";
const Messages = () => {
  const MessagessModel = sequelize.define('messages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_annonces_contacts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'annonces_contacts',
        key: 'id'
      }
    },
    id_sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    messages: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'messages',
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
        name: "id_annonces_contacts",
        using: "BTREE",
        fields: [
          { name: "id_annonces_contacts" },
        ]
      },
      {
        name: "id_sender",
        using: "BTREE",
        fields: [
          { name: "id_sender" },
        ]
      },
    ]
  });
  MessagessModel.belongsTo(Annonces_contacts, { foreignKey: 'id_annonces_contacts' });
  MessagessModel.belongsTo(Users, { foreignKey: 'id_sender' });

  return MessagessModel;
};

export default Messages();