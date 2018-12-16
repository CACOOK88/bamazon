// REQUIRE DEPENDENCIES
require('dotenv').config()
const mysql = require('mysql')
const inquirer = require('inquirer')

//CREATE SQL DATABASE CONNECTION
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'bamazon'
})

//CONNECT TO DATABASE AND START THE MANAGER PROMPT FUNCTION
connection.connect(function( err ) {
  if ( err ) throw err
  console.log(`connected as id ${ connection.threadId }`)
  managerStart()
})

//MANAGER FUNCTION
const managerStart = () => {
  // PROMPT MANAGER FOR HIS COMMAND
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
          'Add New Product',
          'Exit Program'
        ]
      }
    )
    .then(function(res) {
      // CHECK WHICH COMMAND THE MANAGER SELECTED AND RUN THE ASSOCIATED FUNCTION
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
        case 'Exit Program':
          connection.end()
          break
        default: 
          // SOMETHING WENT WRONG, RESTARTING MANAGER FUNCTION
          console.log(`Something went wrong, starting over`)
          managerStart()
      }
    })
}

// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
const listProducts = () => {
  // CONNECT AND DISPLAY ALL PRODUCTS USING THE PRINTDATA FUNCTION.
  // PRINT DATA LOOPS THROUGH AND FORMATS THE SQL INFO FOR READABILITY.
  connection.query(
    'SELECT * FROM  products',
    function( err, res ) {
      printData(err, res)
      // ASK MANAGER FOR NEXT COMMAND
      managerStart()
    }
  )
}

// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
const lowInventory = () => {
  // QUERY THE DATABASE FOR PRODUCTS WHERE QUANTITY IS LESS THAN 5
  // DISPLAY RESULTS WITH PRINTDATA FUNCTION
  connection.query(
    'SELECT * FROM products WHERE stock_quantity < 5', 
    function( err, res ) {
      printData(err, res)
      managerStart()
    }
  )
}

// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
const addInventory = () => {
  // CONNECT TO DATABASE AND SELECT ALL INFORMATION
  connection.query(
    'SELECT * FROM products',
    function(err, res) {
      //PROMPT USER WITH CHOICES TO ADD TO QUANTITY
      inquirer
        .prompt([
          {
            name: 'command', 
            type: 'list',
            message: 'Which quantity would you like to increase?',
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
            message: 'How much?'
          }
        ])
        .then(function(item) {
          // COMPARE MANAGER CHOICE PRODUCT NAME TO DATABASE AND ASSIGN THE ITEM OBJECT TO VARIABLE
          let itemToUpdate;
          for ( let i = 0; i < res.length; i++ ) {
            if ( res[i].product_name === item.command ) {
              itemToUpdate = res[i]
            }
          }
          
          //CALCULATE NEW QUANTITY FOR UPDATE
          let newQuantity = parseInt(itemToUpdate.stock_quantity) + parseInt(item.quantity)

          connection.query(
            //UPDATE QUANTITY OF SELECTED PRODUCT
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
              //CONFIRMATION MESSAGE IN CONSOLE
              console.log(`\n${ itemToUpdate.product_name } updated. New quantity is ${ newQuantity }\n`)
              managerStart()
            }
          )
        })
    }
  )
  
}

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
const addProduct = () => {
  // PROMPT MANAGER FOR THE NEW ITEM INFORMATION REQUIRED
  inquirer
    .prompt([
      {
        name: 'item',
        type: 'input',
        message: 'What product would you like to add to inventory?',
      },
      {
        name: 'department',
        type: 'input',
        message: 'What department?'
      },
      {
        name: 'price',
        type: 'input',
        message: 'What is the list price?'
      },
      {
        name: 'quantity',
        type: 'input',
        message: 'How many do you want to add to stock?'
      }
    ])
    .then(function(answers) {
      // CONNECT TO DATABASE AND INSERT NEW ITEM OBJECT
      connection.query(
        'INSERT INTO products SET ?',
        {
          product_name: answers.item,
          department_name: answers.department,
          price: answers.price,
          stock_quantity: answers.quantity
        },
        function(err, res) {
          if (err) throw err
          // CONFIRM AND RESTART
          console.log(`\n${answers.quantity} ${answers.item} were added to inventory\n`)
          managerStart()
        }
      )
    })
}

// FUNCTION TO LOOP THROUGH RESULTS AND FORMAT EACH COLUMN AND PRINT TO SCREEN
// WITH LINE SEPARATOR
const printData = (err, res) => {
  if ( err ) throw err
  let line = `-----------------------------------------------`
  console.log(``)
  for ( let i in res ) {
    let id = res[i].item_id.toString().padEnd(3, ' ')
    let itemName = res[i].product_name.padEnd(25, ' ')
    let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
    let quantity = res[i].stock_quantity.toString().padStart(6, ' ')
    console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }  On Hand: ${ quantity }\n${ line.padEnd(73, '-') }`)
  } 
  console.log(``)
}