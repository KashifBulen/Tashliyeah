import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      "Vehicles",
      [
        {
          id: '946555c0-0c86-4cb3-9719-1bacd7117142',
          make: "Ford",
          model: "Focus",
          year: 2003,
          transmission: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3a6490fa-54e0-4f36-9e89-d6d11bf34e85',
          make: "Ford",
          model: "Expedition",
          year: 2004,
          transmission: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3b3eecf2-4326-48fd-999f-2319e6cba6b3',
          make: "Ford",
          model: "any thing",
          year: 2004,
          transmission: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('Vehicles', {});
  }
};
