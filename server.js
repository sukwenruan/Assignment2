//server.js (referenced Sal's)

// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

//imports querystring as variable qs
const qs = require('querystring');

// Monitor all requests regardless of their method (GET, POST, PUT, etc) and their path (URL)
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
}); 

/* Import data from a JSON file containing information about products
__dirname represents the directory of the current module (where server.js is located)
__dirname + "./products.json" specifies the location of products.json
*/
const products = require(__dirname + "/products.json");

// Define a route for handling a GET request to a path that matches "./products.js"
app.get('/products.js', function(request, response, next) {
    
	// Send the response as JS
	response.type('.js');
	
	// Create a JS string (products_str) that contains data loaded from the products.json file
	// Convert the JS string into a JSON string and embed it within variable products
	const products_str = `let products = ${JSON.stringify(products)};`;
	
	// Send the string in response to the GET request
	response.send(products_str);
});

//loop through each product in products
products.forEach((prod, i) => {prod.qty_sold = 0});

//set up middleware to parse incoming requests with URL-encoding
app.use(express.urlencoded({ extended: true }));


//handles POST request to /purchase when form is submitted
app.post("/purchase", function (request, response) {

    //retrieve quantities from form data
    let POST = request.body;

    let has_qty = false;

    let errObj = {};

    //loop through each quantity for products
    for (let i in products) {

        //converts quantity to a number
        let q = POST[`quantity${[i]}`];

        //console.log("the quantity value is " + q);
        //console.log(qs.stringify(POST))

        //initialize variable if valid. otherwise set q>0
        has_qty = has_qty || (q>0);

        //if error is found, set error message in errObj
        if (isNonNegInt(q, false)== false) {
            errObj[`quantity${[i]}_error`]=isNonNegInt(q, true);
        }
    }

    //check if has_qty is false and no erorrs in errObj. if true, redirect to products_display.html with error parameter
    if (has_qty == false && Object.keys(errObj).length == 0) {
        response.redirect("./products_display.html?error");
    }

    //if has_qty is true and no errors in errObj, update quantities sold and avaiable and redirect to invoice.html
    else if (has_qty == true && Object.keys(errObj).length == 0) {

        //loops through each product
        for (let i in products) {
            let q = POST[`quantity${[i]}`];

            //subtract bought quantity from total quantity available
            products[i].qty_available = products[i].qty_available - Number(q); 

            //increment quantity sold 
            products[i].qty_sold += Number(q);
        }
    
        //redirect to invoice with valid parameters and POST data
        response.redirect("./invoice.html?valid&" + qs.stringify(POST));

    }

    //if there's errors in errObj, redirect to products_display.html with error parameters
    else if (Object.keys(errObj).length > 0) {
        response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputErr`);
    }

})

//function that validates quantity if it's an integer or not (client-side)
function isNonNegInt(q, returnErrors = false) {
    let errors = []; 
    //console.log(typeof(Number(q)))
    if (isNaN(Number(q)) && (q != "")) { 
        errors.push('Not a number. Please enter a numeric value.');
    } 
    else 
    {                
        if (q < 0)  {
            errors.push('Negative value. Please enter a positive value.'); 

        } else if ((parseInt(q) != q) && (q != 0)) {
            errors.push('Not an integer. Please enter an integer.');
        } 
    }
    return (returnErrors ? errors : (errors.length == 0));
};

// Route all other GET requests to serve static files from a directory named "public"
app.use(express.static(__dirname + '/public'));

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));