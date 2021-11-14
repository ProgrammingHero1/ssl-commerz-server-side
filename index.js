const express = require('express')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const SSLCommerzPayment = require('sslcommerz')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');


const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

// Demo Env files if necessary:-------------------------------

// STORE_ID=<get your storeId>
// STORE_PASSWORD=<get your store password>

// -----------------------------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0qwx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    // Create collection
    const orderCollection = client.db("paymentssl").collection("orders");

    // Initialize payment
    app.post('/init', async (req, res) => {
        console.log("hitting")
        const productInfo = {
            total_amount: req.body.total_amount,
            currency: 'BDT',
            tran_id: uuidv4(),
            success_url: 'http://localhost:5000/success',
            fail_url: 'http://localhost:5000/failure',
            cancel_url: 'http://localhost:5000/cancel',
            ipn_url: 'http://localhost:5000/ipn',
            paymentStatus: 'pending',
            shipping_method: 'Courier',
            product_name: req.body.product_name,
            product_category: 'Electronic',
            product_profile: req.body.product_profile,
            product_image: req.body.product_image,
            cus_name: req.body.cus_name,
            cus_email: req.body.cus_email,
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: req.body.cus_name,
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
            multi_card_name: 'mastercard',
            value_a: 'ref001_A',
            value_b: 'ref002_B',
            value_c: 'ref003_C',
            value_d: 'ref004_D'
        };

        // Insert order info
        const result = await orderCollection.insertOne(productInfo);

        const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, false) //true for live default false for sandbox
        sslcommer.init(productInfo).then(data => {
            //process the response that got from sslcommerz 
            //https://developer.sslcommerz.com/doc/v4/#returned-parameters
            const info = { ...productInfo, ...data }
            // console.log(info.GatewayPageURL);
            if (info.GatewayPageURL) {
                res.json(info.GatewayPageURL)
            }
            else {
                return res.status(400).json({
                    message: "SSL session was not successful"
                })
            }

        });
    });
    app.post("/success", async (req, res) => {

        const result = await orderCollection.updateOne({ tran_id: req.body.tran_id }, {
            $set: {
                val_id: req.body.val_id
            }
        })

        res.redirect(`http://localhost:3000/success/${req.body.tran_id}`)

    })
    app.post("/failure", async (req, res) => {
        const result = await orderCollection.deleteOne({ tran_id: req.body.tran_id })

        res.redirect(`http://localhost:3000`)
    })
    app.post("/cancel", async (req, res) => {
        const result = await orderCollection.deleteOne({ tran_id: req.body.tran_id })

        res.redirect(`http://localhost:3000`)
    })
    app.post("/ipn", (req, res) => {
        console.log(req.body)
        res.send(req.body);
    })
    app.post('/validate', async (req, res) => {
        const result = await orderCollection.findOne({
            tran_id: req.body.tran_id
        })

        if (result.val_id === req.body.val_id) {
            const update = await orderCollection.updateOne({ tran_id: req.body.tran_id }, {
                $set: {
                    paymentStatus: 'paymentComplete'
                }
            })
            console.log(update);
            res.send(update.modifiedCount > 0)

        }
        else {
            res.send("Chor detected")
        }

    })
    app.get('/orders/:tran_id', async (req, res) => {
        const id = req.params.tran_id;
        const result = await orderCollection.findOne({ tran_id: id })
        res.json(result)
    })

});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})