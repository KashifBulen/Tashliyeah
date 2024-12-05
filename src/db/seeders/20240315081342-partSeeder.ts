import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      "Parts",
      [
        {
          id: '3aa35d24-da5d-4bc2-b9ae-e01172893035',
          name: "Bumper",
          description: "Bumper with grill",
          origin: "America",
          warranty: "1 week",
          vehicleId: '3a6490fa-54e0-4f36-9e89-d6d11bf34e85',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '8995ff49-8727-4874-895c-31e945957224',
          name: "Front Fender",
          description: "Green color",
          origin: "America",
          warranty: "1 month",
          vehicleId: '946555c0-0c86-4cb3-9719-1bacd7117142',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '46363f5a-ab1b-4fca-8eaf-5df780d92d88',
          name: "Axel",
          description: "Complete Axel",
          origin: "America",
          warranty: "15 days",
          vehicleId: '3b3eecf2-4326-48fd-999f-2319e6cba6b3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'b5791f5f-b87c-4432-8c2c-7f94d4db2ldi',
          name: "Axel",
          description: "Complete Axel",
          origin: "China",
          warranty: "2 months",
          vehicleId: '3b3eecf2-4326-48fd-999f-2319e6cba6b3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'b5791f5f-b87c-4432-8c2c-7f94d4db2pdi',
          name: "Hood",
          description: "Black Color",
          origin: "America",
          warranty: "1 year",
          vehicleId: '3b3eecf2-4326-48fd-999f-2319e6cba6b3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('Parts', {});
  }
};
