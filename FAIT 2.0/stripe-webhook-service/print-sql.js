const fs = require('fs');

// Read the SQL file
const sqlFilePath = './db/complete-setup.sql';
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Print the SQL to the console
console.log(sql);
