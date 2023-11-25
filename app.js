const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sql = require('mssql');

const sqlConfig = {
  user: 'sa',
  password: '123456',
  database: 'QUANLYBDS_5',
  server: 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// const sqlConfig = {
//       user: 'ndhuy2308_',
//       password: 'demo123456',
//       database: 'ndhuy2308_',
//       server: 'sql.bsite.net\\MSSQL2016',
//       pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 30000
//       },
//       options: {
//         encrypt: true,
//         trustServerCertificate: true
//       }
//     };

const connection = async () => {
  try {
    await sql.connect(sqlConfig);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.log('Error connecting to SQL Server:', err);
  }
};

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/api', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Full_Contract');
    const contracts = result.recordset;
    res.json({
      contracts
    });
  } catch (error) {
    console.log('Error retrieving contracts:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

app.get('/', (req, res) => {
  res.render('view');
});

app.get('/contracts/add', (req, res) => {
  res.render('add');
});

app.post('/contracts/sql', async (req, res) => {
  const {
    customerName,
    yearOfBirth,
    ssn,
    customerAddress,
    mobile,
    propertyID,
    dateOfContract,
    price,
    deposit,
    remain,
    status
  } = req.body;

  try {
    const request = new sql.Request();
    const query = `
        INSERT INTO Full_Contract (Customer_Name, Year_Of_Birth, SSN, Customer_Address, Mobile, Property_ID, Date_Of_Contract, Price, Deposit, Remain, Status)
        VALUES (@customerName, @yearOfBirth, @ssn, @customerAddress, @mobile, @propertyID, @dateOfContract, @price, @deposit, @remain, @status);
      `;
    request.input('customerName', sql.NVarChar, customerName);
    request.input('yearOfBirth', sql.Int, yearOfBirth);
    request.input('ssn', sql.NVarChar, ssn);
    request.input('customerAddress', sql.NVarChar, customerAddress);
    request.input('mobile', sql.NVarChar, mobile);
    request.input('propertyID', sql.Int, propertyID);
    request.input('dateOfContract', sql.Date, dateOfContract);
    request.input('price', sql.Decimal, price);
    request.input('deposit', sql.Decimal, deposit);
    request.input('remain', sql.Decimal, remain);
    request.input('status', sql.NVarChar, status);

    await request.query(query);
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

connection().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});