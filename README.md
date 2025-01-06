# My Data Buddy

My Data Buddy is a promising start-up that aims to help people to keep track and optimize their mobile data cost.

The company wants to provide an API service that can keep track of historical data usage for their registered customers
and give recommendations for optimal data plan based on customers' usage-patterns.

Typically, a mobile carrier in Singapore would offer some data plan packages that have fixed subscription price and fixed amount of free data in GB (1GB = 1000MB). <br>
Any excess usage will be applied additional charges on top of the package's price. <br>
The amount of free data will be reset at the start of every billing cycle.

## Local development
### Prerequisites
NodeJS 18 (or higher)

### Install packages
```shell
yarn install
```

### Configure Environment Variables: 
#### Create a .env file in the root directory and add the following:
```shell
DATABASE_URL="file:./dev.db"
JWT_SECRET=<YOUR_JWT_SECRET>
```

#### Create a .env.test file in the root directory and add the following:
```shell
DATABASE_URL="file:./test.db"
NODE_ENV="test"
JWT_SECRET=<YOUR_JWT_SECRET>
```

### Migrate the database
#### Migrate the Database: Run the following commands to set up the database schema and generate the Prisma client:
```shell
yarn prisma-migrate
yarn prisma-generate
```

### Check Prisma SQLite dashboard to inspect the DB
```shell
npx prisma studio
```

### Build & Run 
```shell
yarn build
yarn start
```

### Generate sample data for import
```shell
yarn generate-test-data
```

### Test
```shell
yarn test
```




