//login.js

//populates invoice table
document.querySelector('#loginPage').innerHTML += `
    <h5 style="font-size: 17px;">Welcome!</h5>
    <h5 style="font-size: 17px;">Please login to your Lovelly Account:</h5> <br>
    <input id="username_tag" type="text" name="username" class="input" style="padding:8px" placeholder="Enter username"><br>
    <input type="password" name="password" class="input" style="padding:8px" placeholder="Enter password"><br><br>

`;


//display alert as a response when for loops from server.js are executed depending on the quantity inserted
window.onload = function () {
    let params = (new URL(document.location)).searchParams;
    //if errorMessage is in qry string then put up alert with error message
    if (params.has("loginMessage")) {
        alert(params.get("loginMessage"));
    }
    //make username sticky after inputting wrong password
    if (params.has('wrong_pass')) {
        //username_tag is the ID of username box
        username_tag.value = params.get('wrong_pass')
    }
}



////[POSSIBLY DELETE?]
let params = (new URL(document.location)).searchParams;
if (params.has('errors_object')) {
    //convert string to json string to object
    let errors = JSON.parse(params.get('errors_object'));
    for (err in errors) {
        // put the erroor messages in the span for the element where the error occured
        document.getElementById(`${err}_errors`).innerHTML = errors[err].join('<br>');
        // put value back in textbox (make sticky)
        document.getElementById(err).value = params.get(err);
    }
   
}