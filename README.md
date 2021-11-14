# Packages Used:

- sslcommerz@1.6.6
- express
- cors
- dotenv
- uuid

## APIs:

### Reference: 
https://www.npmjs.com/package/sslcommerz

- /init ---it initializes the transaction. It is a post method which will receive product and customer info for initiating transaction. It will send the gatewayURL as response to the client. It will initially insert the "productInfo" object into the database. 

- /success , /failure , /ipn , /cancel: --- post API where SSlcommerz will send a post response to the link specified in the "productInfo" object with a body containing transaction details. The success method will edit the order payment info and insert the val_id provided by sslcommerz into the collection if the transaction is successful. The order will be removed from the database if the customer closes the gateway or if the payment fails. Then they  will redirect to the specified pages inside res.redirect().

- /orders/:tran_id --- API for finding specific order.

- /validate ---- It will find out the order info from the collection with the help of tran_id and match the val_id sent from the client side. If it matches then the paymentStatus will be confirmed. else it will not allow the customer to confirm the paymentStaus. This can be used to generate payment receipt.

### Open sandbox account and edit ipn settings:

- Go to https://developer.sslcommerz.com/registration/ for opening sandbox account.
- Click on "Create Sandbox Account"
- Insert your information.
    - Your application domain name: http://localhost:5000/ or other domain
    - Your Company name: e.g. ABC Corporation
    - Your company address: Insert address
    - Your name: Insert your name
    - Your email address: Insert your email address
    - Your Phone Number: Insert your Phone number
    - Your Username: Insert an username
    - Your Password: Insert a password
    - Confirm your password.
- Click on "Confirm Registration". Then you will get a verification code via email.
- Validate your account with that verification code.
- After that Online Payment SSLCommerz will send you another email containing your Store Id and password.Preserve this email.
- Using the Merchant Panel URL https://sandbox.sslcommerz.com/manage/ login to your developer merchant account for editing the ipn settings.
- After logging in click on "My Stores" from the navbar. Click on "IPN settings" from the first row last column of the table containing your store information. 
- Check the " Enable HTTP Listener" option and insert the url where you want to receive transaction information. For example (in our case): http://localhost:5000/success
- Click on Save. Then your sslCommerze account setup will be Completed.
