// dependencies and packages
require('dotenv').config()
const mysql = require('mysql')
const inquirer = require('inquirer')

// create connection to mysql database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'bamazon'
})

// Start connection to database and run the start function for customer orders
connection.connect(function( err ) {
  if ( err ) throw err
  console.log(`connected as id ${ connection.threadId }`)
  customerOrder()
})

// Function started by connection
const customerOrder = () => {
  // start query connection
  connection.query('SELECT * FROM products', function( err, res ) {
    if ( err ) throw err
    let line = `-----------------------------------------------`
    // Loop through response and save item data to variables with string padding and int formatting
    for ( let i in res ) {
      let id = res[i].item_id.toString().padEnd(3, ' ')
      let itemName = res[i].product_name.padEnd(25, ' ')
      let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
      // display each item in database
      console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }\n${ line.padEnd(56, '-') }`)
    }  
    inquirer
      // prompt user for which item they'd like to purchase
      .prompt([
        {
          name: 'itemChoice',
          type: 'input',
          message: 'What is the ID of the item you wish to purchase?'
        },
        {
          name: 'quantity',
          type: 'input',
          message: 'How many would you like?'
        }
      ])
      .then(function(answer) {
        let chosenItem
        // loop through query response to match customer choice to res object and set that to a variable
        for ( let i in res ) {
          if ( res[i].item_id === parseInt(answer.itemChoice) ) {
            chosenItem = res[i]
          }
        }

        // Check if there's enough quantity in stock to make purchase
        if ( chosenItem.stock_quantity >= answer.quantity ) {
          // update database with purchase and show customer total cost of purchase
          let newStockQuantity = chosenItem.stock_quantity - answer.quantity
          let totalPrice = (answer.quantity * chosenItem.price).toFixed(2)
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              { stock_quantity: newStockQuantity },
              { item_id: chosenItem.item_id }
            ],
            function(err, res ) {
              if ( err ) throw err
              console.log(`\nYou successfully purchased ${ answer.quantity } ${ chosenItem.product_name } for a total of $${ totalPrice }\n`)
            }
          )
        } else {
          console.log(`Insufficient stock quantity!`)
          
        }
        connection.end()
      })
  })

}