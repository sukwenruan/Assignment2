//server.js 

// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

//imports querystring as variable qs
const qs = require('querystring');
let qString;

//load file system module
let fs = require('fs')

// save user_data.json to user_data variable
let user_data = './user_data.json'; // get data from user_data.json

let users_reg_data = "";

if (fs.existsSync(user_data)) {
    let file_stats = fs.statSync(user_data);
    // return string, parse to object, set object value to users_reg_data
    let data = fs.readFileSync(user_data, 'utf-8');

    users_reg_data = JSON.parse(data);
}
else {
    //test in console in case user data doesn't go through
    console.log(`${user_data} does not exist!`)
}

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

/*-----------------------------PURCHASE (referenced Sal's)------------------------------------*/
//handles POST request to /purchase when form is submitted
app.post("/purchase", function (request, response) {

    //retrieve quantities from form data
    let POST = request.body;
    // string the query together
    qString = qs.stringify(POST);

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
        response.redirect("./login.html?valid&" + qString);

    }

    //if there's errors in errObj, redirect to products_display.html with error parameters
    else if (Object.keys(errObj).length > 0) {
        response.redirect("./products_display.html?" + qString + `&inputErr`);
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

/*---------------------------------------LOGIN---------------------------------------------*/
app.post("/login", function (request, response) {

    let POST = request.body;
    //empty basket of errors
    let errors = {}; 
    //string for messages
    let loginMessage_str = '';
    let incorrectLogin_str = '';
   
    // validate username and password
    console.log(request.query);
    username = request.body.username.toLowerCase(); // usernames are formatted as lowercase

    if (typeof users_reg_data[username] != 'undefined') { // username and password shouldn't be undefined
        if (users_reg_data[username].password == request.body.password) {
            request.query.username = username;
            console.log(users_reg_data[request.query.username].name);
            request.query.name = users_reg_data[request.query.username].name; // go to invoice if username and password are correct
            request.query.email = users_reg_data[request.query.username].email; // put email in query
            let more_qString = qs.stringify(request.query); // generate new query

            loginMessage_str = `Welcome ${username}, you are logged in!`; //message that displays after login
            response.redirect(`./invoice.html?loginMessage=${loginMessage_str}&` + qString + '&' + more_qString);

            return;
        }

        // if password is incorrect, show 'Invalid Password' message 
        else { 
            incorrectLogin_str = 'The password is invalid!';
            console.log(errors);
            request.query.username = username;
            request.query.name = users_reg_data[username].name;
        }
    }
    // if username is incorrect, show 'Invalid Username' message 
    else { 
        incorrectLogin_str = 'The username is invalid!';
        console.log(errors);
        request.query.username = username;
    }
    //make username sticky when there's an error
    //redirect to invoice with message
    response.redirect(`./login.html?loginMessage=${incorrectLogin_str}&wrong_pass=${username}`);
});

/*-----------------------------------------REGISTER-----------------------------------------*/
app.post("/register", function (request, response) {

    console.log(request.body);
    //empty basket of errors
    let errors = {};
    //string for message display
    let loginMessage_str = '';
    // check if new name is lowercase
    let register_user = request.body.username.toLowerCase();
    let register_email = request.body.email.toLowerCase();

    // validate name, username, email, and pw
    errors['name'] = [];
    errors['username'] = [];
    errors['email'] = [];
    errors['password'] = [];
    errors['confirm_password'] = [];

    // error message when the name is empty
    if (request.body.name == "") {
        errors['name'].push('The name is invalid. Please insert a name.');
    }
    // character limitations (only letters) (ChatGPT)
    if (/^[A-Za-z]+ [A-Za-z]+$/.test(request.body.name)) {
    } else {  // error message when name doesn't follow character guidelines
        errors['name'].push('Please follow the format FirstName LastName! (ex. Sukwen Ruan)');
    }
    // the users full name should only allow letters, no more than 30 characters
    if (request.body.name.length > 30) { // execute errors if the name surpassed limit
        errors['name'].push('The name is too long. Insert a name less than 30 characters.');
    }
    // error for when username is already taken
    if (typeof users_reg_data[register_user] != 'undefined') { 
        errors['username'].push('Username is taken. Please use a different username.');
    }
    // check if email is already registered
    if (Object.values(users_reg_data).some(user => user.email === register_email)) {
        errors['email'].push('This email is already registered. Please use a different email.');
    }
    // character limitations for username (ChatGPT) - only numbers and letters allowed (case insensitive)
    if (/^[0-9a-zA-Z]+$/.test(request.body.username)) {
    } else {
        errors['username'].push('Please use only letters and numbers for your username.');
    }
    // make minimum and maximum characters for username
    if (request.body.username.length > 25 || request.body.username.length < 4) {
        errors['username'].push('Your username must contain 4-25 characters.');
    }
    // email limitations (ChatGPT)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.body.email)) {
        errors['email'].push('Please use a valid format email format (ex. sukwenruan@gmail.com).');
    }
    // password is invalidated with a space
    if (request.body.password.includes(' ')) {
        errors['password'].push('Password cannot contain space characters.');
    }
    // make minimum and maximum characters for password
    if (request.body.password.length > 16 || request.body.password.length < 10) {
        errors['password'].push('Your password must be between 10-16 characters.');
    }
    // makes password have at least one number
    if (!/\d/.test(request.body.password)) {
        errors['password'].push('Your password must contain at least one number.');
    }
    // makes password have at least one special character (ChatGPT)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(request.body.password)) {
        errors['password'].push('Your password must contain at least one special character.');
    }
    // check to see if the passwords match
    if (request.body.password != request.body.confirm_password) {
        errors['confirm_password'].push('Your passwords do not match.');
    }

    // request name, username, and email
    request.query.name = request.body.name;
    request.query.username = request.body.username;
    request.query.email = request.body.email;


    // remember user information given no errors (save info)
    let num_errors = 0;
    for (let err in errors) {
        num_errors += errors[err].length;
    }
    if (num_errors == 0) {
        POST = request.body;
        
        // remember user information if there are no errors
        let username = POST["username"];
        // empty basket of future usernames
        users_reg_data[username] = {};
        //request name, password, and email
        users_reg_data[username].name = request.body.name;
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;

        // stringify user's information
        data = JSON.stringify(users_reg_data); 
        fs.writeFileSync(user_data, data, "utf-8");
        request.query.name = users_reg_data[request.query.username].name; 
        request.query.email = users_reg_data[request.query.username].email; // define email
        let more_qString = qs.stringify(request.query); // new query to add to response

        //message display after successful registration
        loginMessage_str = `Welcome ${username}, you are registered!`;
        //redirect to invoice with message
        response.redirect(`./invoice.html?loginMessage=${loginMessage_str}&` + qString + '&' + more_qString);

        console.log(POST, "account information");
    }
    // check for errors
    else {
        console.log('in post register', errors, request.body)
        //errors object for error message (search params)
        request.body.errors_obj = JSON.stringify(errors);
        
        request.query.errors_obj = request.body.errors_obj;
        //make sticky 
        request.query.StickyName = request.body.name;
        request.query.StickyUsername = request.body.username;
        request.query.StickyEmail = request.body.email;
        
        // redirect to register.html
        //response.redirect("./register.html?" + qs.stringify(request.body)); 
        response.redirect("./register.html?" + qs.stringify(request.query)); 

    }
});

// Route all other GET requests to serve static files from a directory named "public"
app.use(express.static(__dirname + '/public'));
// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));