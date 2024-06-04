import {DataTypes, sequelize} from "../sequelize.js";

const Categories = () => {
    return sequelize.define('categories', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        label: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'categories',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "id"},
                ]
            },
        ]
    });
};

export default Categories();