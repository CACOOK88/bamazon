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
  managerStart()
})

const managerStart = () => {
  inquirer
    .prompt(
      {
        name: 'command',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View Products For Sale',
          'View Low Inventory',
          'Add to Inventory',
          'Add New Product'
        ]
      }
    )
    .then(function(res) {
      switch ( res.command ) {
        case 'View Products For Sale':
          listProducts()
          break
        case 'View Low Inventory':
          lowInventory()
          break
        case 'Add to Inventory':
          addInventory()
          break
        case 'Add New Product':
          addProduct()
          break
        default: 
          console.log(`Something went wrong, starting over`)
          managerStart()
      }
    })
}
// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.

const listProducts = () => {
  connection.query(
    'SELECT * FROM  products',
    function( err, res ) {
      printData(err, res)
    }
  )
  setTimeout(managerStart,500)
}

// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
const lowInventory = () => {
  connection.query(
    'SELECT * FROM products WHERE stock_quantity < 5', 
    function( err, res ) {
      printData(err, res)
    }
  )
  setTimeout(managerStart,500)
}
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
const addInventory = () => {
  connection.query(
    'SELECT * FROM products',
    function(err, res) {
      inquirer
        .prompt([
          {
            name: 'command', 
            type: 'list',
            message: 'Which quantity would you like to update?',
            choices: function() {
              let arr = []
              for ( let i = 0; i < res.length; i++ ){
                arr.push(res[i].product_name)
              }
              return arr
            }
          },
          {
            name: 'quantity',
            type: 'input',
            message: 'How many'
          }
        ])
        .then(function(item) {
          let itemToUpdate;
          for ( let i = 0; i < res.length; i++ ) {
            if ( res[i].product_name === item.command ) {
              itemToUpdate = res[i]
            }
          }
          
          let newQuantity = parseInt(itemToUpdate.stock_quantity) + parseInt(item.quantity)

          connection.query(
            'UPDATE products SET ? WHERE ?',
            [
              {
                stock_quantity: newQuantity
              },
              {
                item_id: itemToUpdate.item_id
              }
            ], function( err ) {
              if ( err ) throw err
              console.log(`${ itemToUpdate.product_name } updated. New quantity is ${ newQuantity } `)
            }
          )
          setTimeout(managerStart,500)
        })
    }
  )
  
}

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
const addProduct = () => {

}

const printData = (err, res) => {
  if ( err ) throw err
  let line = `-----------------------------------------------`
  for ( let i in res ) {
    let id = res[i].item_id.toString().padEnd(3, ' ')
    let itemName = res[i].product_name.padEnd(25, ' ')
    let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
    let quantity = res[i].stock_quantity.toString().padStart(6, ' ')
    console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }  On Hand: ${ quantity }\n${ line.padEnd(73, '-') }`)
  } 
}