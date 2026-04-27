import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Overtime = db.define('overtime', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    worker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'data_pegawai',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        validate: {
            min: 1,
            max: 6
        }
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [10, 255]
        }
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default Overtime;
