//products_display.js (referenced Vy and Sal)

//loops through products to display on page 
for (let i = 0; i < products.length; i++) {
    document.querySelector('.main').innerHTML += `
        <div>
            <h2>${products[i].name}</h2>
            <h2>$${(products[i].price).toFixed(2)}</h2>
            <img src="${products[i].image}" class="img-thumbnail">
            <p style="padding: 7px; margin: 0">Available: ${products[i].qty_available}</p>
            <p style="padding: 7px; margin: 0">Sold: ${products[i].qty_sold}</p>

            <label for="quantity_textbox_${i} id="quantity${i}_label" style="padding: 15px;" class="quantity-input">Quantity Desired</label>
            <input type="text" name="quantity${[i]}" id="quantity_textbox${[i]}" onchange="validateTextbox(this)">

            <div id="quantity${[i]}_error" style="color: red;"></div>
        <div>
    `; 
}

//function that validates quantity if it's an integer or not (client-side)
function isNonNegInt(q, returnErrors = false) {
    errors = []; 
    console.log(typeof(Number(q)))
    if (isNaN(Number(q)) && (q != "")) { 
        errors.push('Not a number. Please enter a numeric value.');

    } else {                
        if ((parseInt(q) == q) && (q >= 0)) {
            for (let i = 0; i < products.length; i++) {
                let input = document.getElementById(`quantity_textbox${[i]}`).value;
                if ((input > 0) && (input > products[i].qty_available)) {
                    errors.push(`${q} is not available. We only have ${products[i].qty_available}.`);

                    let availInv = q - products[i].qty_available; 
                    document.getElementById(`quantity_textbox${[i]}`).value = q - availInv;
                } 
            }      
        }
        if (q < 0)  {
            errors.push('Negative value. Please enter a positive value.'); 

        } else if ((parseInt(q) != q) && (q != 0)) {
            errors.push('Not an integer. Please enter an integer.');
        } 
    }
    return (returnErrors ? errors : (errors.length == 0));

}

// validates textbox with isNonNegInt function 
function validateTextbox(textBox) {
    entry = String(textBox.value);

    //if user enters a value with a 0 in front, it will be converted to a number without it 
    if (entry.charAt(0) == 0) {
        textBox.value = Number(entry.slice(0, 0) + entry.slice(1, entry.length));
    }

    //state errors variable contains the array of error messages 
    errors = isNonNegInt(textBox.value, true);

    //if error is found, error message is displayed by updating HTML content (otherwise, it is an empty string)
    document.getElementById(textBox.name + '_error').innerHTML =  errors.join('');

    //if error is found, textbox turns red and displays error message. otherwise, the textbox is black
    if (errors.length != 0) {
        textBox.style.borderColor = "red";
    }
    else {
        textBox.style.borderColor = "black";
    }
};


// get paramters from URL
let params = (new URL(document.location)).searchParams;

//if there's an error from server-side validation, display error message and make user retry with a valid input against isNonNegInt
//window.onload makes the code run after page is fully loaded
window.onload = function() {

    //referenced Chet (aka ChatGPT)
    const errMsgElement = document.getElementById('errMsg');
    
    //if error and inputErr is found in parameters, display error message
    if (params.has('error')) {
        errMsgElement.innerHTML = "No quantities selected.";

    } else if (params.has('inputErr')) {
        errMsgElement.innerHTML = "Please enter valid quantities to purchase.";

        //loops through products to handle input errors 
        for (let i = 0; i < products.length; i++) {
            const quantityValue = params.get(`quantity${i}`);
            const quantityTextbox = qty_form[`quantity_textbox${[i]}`];

            //if quantityValue = 0, textbox becomes empty. otherwise, it sets the value and makes textbox border red due to validation error 
            if (quantityValue == 0) {
                quantityTextbox.value = '';
            } else {
                quantityTextbox.value = quantityValue;
                quantityTextbox.style.borderColor = "red";
            }

            //errors are obtained from isNonNegInt function and displays error messages
            const errors = isNonNegInt(quantityValue, true);
            document.getElementById(`quantity${i}_error`).innerHTML = errors.join('');  
        }
    }

}