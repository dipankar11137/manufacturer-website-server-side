const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqrnv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const cameraCollection = client.db('tools-manufacture').collection('cameraProducts');
        const mobileCollection = client.db('tools-manufacture').collection('mobilePhone');
        const laptopCollection = client.db('tools-manufacture').collection('laptopProducts');

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