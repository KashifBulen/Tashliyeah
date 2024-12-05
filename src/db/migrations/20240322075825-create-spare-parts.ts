import { QueryInterface, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('SpareParts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: () => uuidv4(),
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
      make: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.INTEGER
      },
      partCondition: {
        type: Sequelize.STRING
      },
      partOrigin: {
        type: Sequelize.STRING
      },
      partWarranty: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      requestId: {
        type: Sequelize.STRING
      },
      vendorId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('SpareParts');
  }
};








