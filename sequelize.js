import {DataTypes, Sequelize} from "sequelize";
import config from "./config/config.json" assert {type: "json"};

const sequelize = new Sequelize(config.development);
export {DataTypes, sequelize};
