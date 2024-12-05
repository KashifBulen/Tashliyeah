import { QueryInterface } from 'sequelize';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    
    await queryInterface.bulkInsert(
      "Customers",
      [
        {
          id: 'e28785f6-eb8a-419d-bff8-77f7c77adc74',
          image: 'https://img.freepik.com/free-photo/bohemian-man-with-his-arms-crossed_1368-3542.jpg?w=740&t=st=1713808266~exp=1713808866~hmac=a5b34762d0f7bdcbed6b77fddcbeec23d374ef7d5961e0629f6a8d6cdc99e028',
          email: 'customer@gmail.com',
          number: '0096614707766',
          callingCode: '+923',
          countryCode: 'PK',
          name: 'Customer',
          password: '$2b$10$UDf70gvQLSc7MuIvMAJ9COD86Ex4PbLtGcRxvexeFq.sF4t0KR1Oy',
          car: 'mercedees',
          driverLicense: 'ABC123',
          verify: 'n',
          roleId: 'f2f04bf9-e0c8-4943-9c62-dd79733c05d3',
          // deviceToken:"jshdfgsjdh45454kjhk",
          createdAt: new Date(),
          updatedAt: new Date()

        },

      ],
      {}
    );

  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('Customers', {});

  }
};


