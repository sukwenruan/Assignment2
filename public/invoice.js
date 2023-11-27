//invoice.js 

// Get the URL
let params = (new URL(document.location)).searchParams; 
// stop user from going to the invoice if not logged in
// check if user is logged in or registered. if not, show alert message
if (params.has('username') == false) { 
  alert('Please log in or register first!');
  //redirect to products_display after alert message
  location.href = './products_display.html'; 
  window.stop;
  }

//personalization to thank buyer with their name and email-->
document.querySelector('#invoiceMessage').innerHTML += `
<br><br>
<h2 style="font-size:20px; font-weight: bolder;">${params.get('name')}, thank you for your order!</h2>
<h2>Your receipt has been sent to ${params.get('email')}</h2>
`;

//initialize variables
let subtotal = 0;
let extended_price = 0;
let shipping = 0;
let total = 0;

let quantity = [];

//loop through products to retrieve quantities from URL
for (let i = 0; i < products.length; i++) {
    console.log(params.get(`quantity${i}`));
    quantity.push(params.get(`quantity${i}`));
}

//loop through quantities to generate table rows
quantity.forEach((qty, i) => {
    //skip if quantity is 0 or empty
    if (qty == 0 || qty === '') return;

    //calculate extended price and update subtotal
    let extended_price = (qty * products[i].price).toFixed(2);
    subtotal += Number(extended_price);

    //populates invoice table
    document.querySelector('#invoiceTable').innerHTML += `
        <tr style="border: none;">
            <td width="10%">
                <a href="#" data-bs-toggle="tooltip" data-bs-placement="top" title="${products[i].product_description}"><img src="${products[i].image}"></a>
            </td>
            <td style="text-align: left">${products[i].name}</td>
            <td>${qty}</td>
            <td>$${products[i].price.toFixed(2)}</td>
            <td>$${extended_price}</td>
        </tr>
    `;
});

//compute tax
let tax_rate = 0.0575;
let tax = tax_rate*subtotal;

//compute shipping
if(subtotal<=50) {
  shipping=5;
} else if(subtotal<=100) {
  shipping=10;
} else {
  shipping=0.15*subtotal;
}

//compute total
total = subtotal + tax + shipping;

//populate total, subtotal, tax, and shipping cells
document.querySelector('#totalCells').innerHTML += `
    <tr>
        <td colspan="4" style="text-align:left;">Subtotal</td>
        <td>$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align:left;">Tax @ ${Number(tax_rate) * 100}%</td>
        <td>$${tax.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align:left;">Shipping</td>
        <td>$${shipping.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align:left;"><b>Total</td>
        <td>$${total.toFixed(2)}</td>
    </tr>
`;

 //display alert as a response when for loops from server.js are executed depending on the quantity inserted
 window.onload = function () {
    let params = (new URL(document.location)).searchParams;
    //if error message is in qry string then put up alert with error message
    if (params.has("loginMessage")) {
      alert(params.get("loginMessage"));
    }
  }