require('dotenv').config()
const mysql = require('mysql')
const inquirer = require('inquirer')

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'bamazon'
})

connection.connect(function( err ) {
  if ( err ) throw err
  console.log(`connected as id ${ connection.threadId }`)
  customerOrder()
})

const customerOrder = () => {
  connection.query('SELECT * FROM products', function( err, res ) {
    if ( err ) throw err
    let line = `-----------------------------------------------`
    // console.log(res[0].item_id.toString().padEnd(4, ' '))
    // console.log(typeof res[0].price)
    for ( let i in res ) {
      console.log(`ID: ${ res[i].item_id.toString().padEnd(3, ' ') } Item: ${ res[i].product_name.padEnd(25, ' ') } Price: ${ res[i].price }\n${ line.padEnd(55, '-') }`)
    }
    connection.end()
  })
}