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
      let id = res[i].item_id.toString().padEnd(3, ' ')
      let itemName = res[i].product_name.padEnd(25, ' ')
      let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
      console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }\n${ line.padEnd(56, '-') }`)
    }  
    inquirer
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
        // console.log(res[0].item_id)
        // console.log(answer.itemChoice)
        for ( let i in res ) {
          if ( res[i].item_id === parseInt(answer.itemChoice) ) {
            chosenItem = res[i]
          }
        }
        // console.log(chosenItem)

        if ( chosenItem.stock_quantity > answer.quantity ) {
          // update database with purchase and show customer total cost of purchase
          let newStockQuantity = chosenItem.stock_quantity - answer.quantity
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              { stock_quantity: newStockQuantity },
              { item_id: chosenItem.item_id }
            ],
            function(err, res ) {
              if ( err ) throw err
              console.log(`\nYou successfully purchased ${ answer.quantity } ${ chosenItem.product_name } for a total of $${ (answer.quantity * chosenItem.price).toFixed(2) }\n`)
            }
          )
          connection.end()

        } else {
          console.log(`Insufficient stock quantity!`)
          connection.end()
        }
      })
  })

}