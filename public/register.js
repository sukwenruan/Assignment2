//register.js

document.querySelector('.registerPage').innerHTML += `
    
    <h5 style="font-size: 17px;">Register your Account!</h5>
    <br>

    <!--NAME-->
    <label for="name">Name</label><br>
    <input type="text" name="name" id="name" placeholder="Enter Name" style="padding:8px">
    <div id="name_errors" style="color: red;"></div>

    <br>

    <!--USERNAME-->
    <label for="username">Username</label><br>
    <input type="text" name="username" id="username" placeholder="Enter Username" style="padding:8px">
    <div id="username_errors" style="color: red;"></div>

    <br>

    <!--EMAIL-->
    <label for="email">Email</label><br>
    <input type="text" name="email" id="email" placeholder="(ex. sukwenruan@gmail.com)" style="padding:8px">
    <div id="email_errors" style="color: red;""></div>

    <br>

    <!--PASSWORD-->
    <label for="password">Password</label><br>
    <input type="password" name="password" id="password" placeholder="Enter Password" style="padding:8px">
    <div id="password_errors" style="color: red;"></div>

    <br>

    <!--CONFIRM PASSWORD-->
    <label for="repeat_password">Confirm Password</label><br>
    <input type="password" name="confirm_password" id="confirm_password" placeholder="Confirm Password" style="padding:8px">
    <div id="confirm_password_errors" style="color: red;"></div>

    <br>

`;

//display alert as a response when for loops from server.js are executed depending on the quantity inserted
window.onload = function () {
    let params = (new URL(document.location)).searchParams;
    //if errorMessage is in qry string then put up alert with error message
    if (params.has("loginMessage")) {
        alert(params.get("loginMessage"));
    }
}

let params = (new URL(document.location)).searchParams;
    if (params.has('errors_obj')) {
        //convert string to json string to object
        let errors = JSON.parse(params.get('errors_obj'));
        for(let err in errors) { 
            // put the error messages in the div for the element where the error occured
            document.getElementById(`${err}_errors`).innerHTML = errors[err].join('<br>');
            // put value back in textbox (make sticky)
            document.getElementById(err).value = params.get(err);
        }
     
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        //set sticky values for name, username, and email
        const stickyName = urlParams.get('StickyName');
        const stickyUsername = urlParams.get('StickyUsername');
        const stickyEmail = urlParams.get('StickyEmail');
        
        if (stickyName) {
            document.getElementById('name').value = stickyName;
        }
        
        if (stickyUsername) {
            document.getElementById('username').value = stickyUsername;
        }
        
        if (stickyEmail) {
            document.getElementById('email').value = stickyEmail;
        }        
    }