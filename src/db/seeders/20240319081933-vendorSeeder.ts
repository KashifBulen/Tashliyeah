import { QueryInterface } from 'sequelize';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      "Vendors",
      [

        {
          id: '68533f5b-4ce2-4027-8da7-6fa247f54d4f',
          image: 'https://variety.com/wp-content/uploads/2022/08/Jonah-Hill.jpg?w=1000&h=563&crop=1&resize=681%2C383',
          email: 'vendor@gmail.com',
          number: '0096614707766',
          callingCode: '+92',
          countryCode: 'PK',
          name: 'Vendor',
          password: '$2b$10$UDf70gvQLSc7MuIvMAJ9COD86Ex4PbLtGcRxvexeFq.sF4t0KR1Oy',
          shopName: 'VendorShop',
          shopLocation: 'Miami Beach - South Beach',
          commercialLicense: 'abc1234',
          attachShopPic: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvcCUyMGZyb250fGVufDB8fDB8fHww',
          verify: 'n',
          roleId: 'ddea8ecb-1d15-42d0-9429-f776f7cef8b6',
          // deviceToken: "jshdfgsjdh45454kjhk",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

  },

  async down(queryInterface: QueryInterface) {

    await queryInterface.bulkDelete('Vendors', {});

  }
};

