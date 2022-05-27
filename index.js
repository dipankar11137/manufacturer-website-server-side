const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqrnv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const cameraCollection = client.db('tools-manufacture').collection('cameraProducts');
        const mobileCollection = client.db('tools-manufacture').collection('mobilePhone');
        const laptopCollection = client.db('tools-manufacture').collection('laptopProducts');
        const userCollection = client.db('tools-manufacture').collection('users');


        // users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        // get user
        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        // camera
        app.get('/cameraProducts', async (req, res) => {
            const query = {};
            const cursor = cameraCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // mobile
        app.get('/mobilePhone', async (req, res) => {
            const query = {};
            const cursor = mobileCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // Laptop
        app.get('/laptops', async (req, res) => {
            const query = {};
            const cursor = laptopCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // post camera data
        app.post('/cameraProducts', async (req, res) => {
            const newProducts = req.body;
            const result = await cameraCollection.insertOne(newProducts);
            res.send(result);
        });

        //Delete camera item
        app.delete('/cameraProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cameraCollection.deleteOne(query);
            res.send(result);
        });
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Manufacture tools Running')
})

app.listen(port, () => {
    console.log(`Manufacture tools  port on :  ${port}`)
})