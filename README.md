#run this for migrate 
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate

==>run peoject with:<==

npm run dev
npm run migrate
yarn build


#otp table 
#send ot[p update
#verify otp update
#signup update api




#  Question to ask in meeting Dated on 12-03-2024 9:00
How to filter in vendor and customer flow “ ”



===> to be noted <===
remove accept and reject order part in vendor order


===> to be noted <===
1. which push notification platform use,




Request has many Bid (one-to-many)
Bid belongs to Request (many-to-one)
Bid belongs to SparePart (many-to-one)
SparePart has many Bid (one-to-many)
Bid belongs to Vendor (many-to-one)
Vendor has many Bid (one-to-many)
Vendor has many Review (one-to-many)
Review belongs to Vendor (many-to-one)



=========⇒ > Specific commands for sequelize for migrations and seeds <===============


To run all migration:
npx sequelize-cli db:migrate

To revert all migration:
npx sequelize-cli db:migrate:undo:all


To run all seeds files:
npx sequelize-cli db:seed:all

To revert all seeds files:
npx sequelize-cli db:seed:undo:all



================ >  create model and generate migration file < ===================
npx sequelize-cli model:generate --name Product --attributes name:string,price:decimal,quantity:integer




================ >  create model and generate migration file < ===================





Certainly! I'll provide you with examples of generating migrations, reverting migrations, generating seed files, and reverting seed files using Sequelize CLI.

Generating Migration:
To generate a migration, you can use the following command:

bash
Copy code
sequelize migration:generate --name migration-name
For example:

bash
Copy code
sequelize migration:generate --name add-fields-to-user
Reverting Migration:
To revert the last migration, you can use the following command:

bash
Copy code
sequelize db:migrate:undo
Generating Seed File:
To generate a seed file, you can use the following command:


Once you've updated your configuration file, try running the migration command again:

bash
Copy code
sequelize-cli db:migrate --to 20240312194743-create-user


bash
Copy code
sequelize seed:generate --name seed-name
For example:

bash
Copy code
sequelize seed:generate --name demo-users
Reverting Seed File:
To revert the last seed file, you can use the following command:

sequelize db:seed:undo
Putting It All Together:
Here's a complete example of generating migrations, reverting migrations, generating seed files, and reverting seed files:


Generate Migration:

Edit the generated migration file to define changes.
sequelize migration:generate --name add-fields-to-user



Run Migration:

Generate Seed File:
sequelize db:migrate


Edit the generated seed file to add seed data.
sequelize seed:generate --name demo-users



Run Seeds:

This command will execute all seed files.
sequelize db:seed:all



Revert Seed:

This command will revert the last seed file.
sequelize db:seed:undo


Revert Migration:

This command will revert the last migration.
sequelize db:migrate:undo
