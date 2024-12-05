import { QueryInterface, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface:QueryInterface, Sequelize:typeof DataTypes) {
    await queryInterface.createTable('Vendors', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: () => uuidv4(),
      },
      image: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      number: {
        type: Sequelize.STRING
      },
      callingCode: {
        type: Sequelize.STRING
      },
      countryCode: {
        type: Sequelize.STRING,
    },
      email: {
        unique:true,
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      verify: {
        type: Sequelize.STRING
      },
      roleId: {
        type: Sequelize.STRING
      },
      shopName: {
        type: Sequelize.STRING
      },
      shopLocation: {
        type: Sequelize.STRING
      },
      commercialLicense: {
        type: Sequelize.STRING
      },
      attachShopPic: {
        type: Sequelize.STRING
      },
      // deviceToken: {
      //   type: Sequelize.STRING
      // },
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
  async down(queryInterface:QueryInterface) {
    await queryInterface.dropTable('Vendors');
  }
};