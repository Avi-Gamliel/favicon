const express = require('express');
const http = require('http')
const app = express();
const server =http.createServer(app)
const path  = require('path')
const mysql = require('mssql')
const {databaseOptions} = require('./config.server.js')
global.users = 0
app.get('/admin', (erq,res)=>{
  console.log('asdasd')
    res.status(200).send(data)
})


// var config = {
    
//     host: databaseOptions.host,
//     user     : databaseOptions.user,
//     password : databaseOptions.password,
//     database : databaseOptions.database
// };

// var con = mysql.createConnection({
//     host: "localhost",
//     user     : 'avi',
//     password : 'Lital_9090',
//     database : 'users'
//  });
  

  // mysql.connect(databaseOptions,function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  // });

const PORT = process.env.PORT || 1200

app.use('/', express.static(path.join(__dirname, 'client/build')))

server.listen(PORT, ()=>console.log(`server is running on port: ${PORT}`))