import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          id: 'f2f04bf9-e0c8-4943-9c62-dd79733c05d3',
          roleName: 'CUSTOMER',
          createdAt: new Date(),
          updatedAt: new Date()

        },
        {
          id: 'ddea8ecb-1d15-42d0-9429-f776f7cef8b6',
          roleName: 'VENDOR',
          createdAt: new Date(),
          updatedAt: new Date()

        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('Roles', {});
  }
};
