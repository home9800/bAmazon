var mysql = require('mysql');
var inquirer = require('inquirer');

//Global variable for the Id and the Quantity 

var buyingID; //ID of the item.
var buyingQuantity; //Quantity the customer would like to buy.
var stock_quantity; // Pulls the mysql quantity


//MySQL connection
var connection = mysql.createConnection({
  host     : 'localhost',
  port     :  3306,
  user     : 'root',
  password : 'root',
  socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock' ,
  database : 'bamazon'
});

//Checks to see if were connected to MySQL, if yes then console log will run. 
connection.connect(function(err) {
  if (err) throw err;
  console.log('connected as id: ' + connection.threadId);
  startPrompt();
});

//Intial Prompt

function startPrompt() {

  inquirer.prompt([{

      type: "confirm",
      name: "confirm",
      message: "Welcome to Bamazon! Would you like to view our inventory?",
      default: true

  }]).then(function(user) {
      if (user.confirm === true) {
          inventory();
      } else {
          console.log("Thank you! Come back soon!");
      }
  });
}

//Intializes function as soon as we run node. 
function inventory() {
  connection.query("select * from products", function (err,result,fields) {
    if (err) throw err;
    console.log(result);
    secondPrompt();
  })

};

function secondPrompt() {
  
  inquirer.prompt([{

    type: "confirm",
    name: "confirm",
    message: "Would you like to purchase from our inventory?",
    default: true

}]).then(function(user) {
    if (user.confirm === true) {
        buying();
    } else {
        console.log("Thank you! Come back soon!");
    }
});

}

//Gives us the id of the item the customer would like to buy.
function buying() {
  inquirer.prompt([{

    type: "input",
    name: "ID",
    message: "What is the ID of the product you would like to buy?",
    
}]).then(function(answer) {
    
  buyingID = answer.ID;
  console.log(buyingID);
  quantity();
    //answer returns { ID: '3' }
});
}

function quantity() {
  inquirer.prompt([{

    type: "input",
    name: "Quantity",
    message: "What is the quantity you would like to buy?",
    
}]).then(function(answer) {
    
  buyingQuantity = answer.Quantity;
  console.log(buyingQuantity);

  realQuantity();
  prePurchase();
});
}

function realQuantity() {
    connection.query(`SELECT stock_quantity FROM products Where item_id='${buyingID}'`, function (err,result,fields) {
      if (err) throw err;
     stock_quantity = (result[0].stock_quantity);
    })
    
  };


//Pre purchase inspection 

function prePurchase() {
    
    if (stock_quantity < buyingQuantity) {
        console.log("Sorry but the quantity you entered exceeds our stock, please try again")
    } else {
        setTimeout(function(){
            buyConfirm();
          },1000);
    }

}


//Ask the user if they would like to buy

function buyConfirm() {

    //Stock calculation to find real quantity
    var stock_calculation = stock_quantity - buyingQuantity

  inquirer.prompt([{

    type: "confirm",
    name: "confirm",
    message: "Confrim your buying item with ID " + buyingID + " and the quantity of " + buyingQuantity + " units." ,
    default: true

}]).then(function(user) {
    if (user.confirm === true) {

        //Code execution into MYSQL
        connection.query(`UPDATE products SET stock_quantity='${stock_calculation}' WHERE item_id='${buyingID}' `, function (err,result,fields) {
            if (err) throw err;
          })

        console.log("Thank you! Come back soon!")
    } else {
        console.log("Ooops Come Back Soon");
    }
});

}
