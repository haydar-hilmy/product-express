const express = require('express');
const mongodb = require('mongodb');
const db = require('../data/database');
const jwt = require('jsonwebtoken');
const ObjectId = mongodb.ObjectId;
const router = express.Router();
require('dotenv').config();

var SECRET_KEY = process.env.USER_TOKEN

function requireAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null }); // Menampilkan halaman login
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`${username} tries to login`);

    const user = await db.getDb().collection('user').findOne({ username });

    if (!user) {
        console.log(`Username "${username}" is not found`);
        return res.render('login', { errorMessage: 'Username not found!' }); 
    }

    if (password !== user.password) {
        console.log('Password is incorrect');
        return res.render('login', { errorMessage: 'Password incorrect!' }); 
    }
    
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    console.info("\nLogin Success\n")
    res.redirect('/'); 
});


router.get('/', requireAuth, async function (req, res) {
    const products = await db
        .getDb()
        .collection('products')
        .find()
        .toArray();
    let productSorted = products.reverse();
    res.render('home', { products: productSorted })
});

router.get('/new-product', async function (req, res) {
    const category = await db.getDb().collection('category').find().toArray();
    res.render('create-product', { category: category });
});

router.get('/product/:id', async function (req, res) {
    const productId = req.params.id;
    const product = await db.getDb().collection('products').findOne({
        _id: new
            ObjectId(productId)
    }, { summary: 0 });
    if (!product) {
        return res.status(404).render('404');
    }
    product.humanReadableDate = product.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    res.render('product-detail', { product: product });
});

router.get('/product/:id/edit', async function (req, res) {
    const category = await db.getDb().collection('category').find().toArray();
    const productId = req.params.id;
    const product = await db
        .getDb()
        .collection('products')
        .findOne({ _id: new ObjectId(productId) }, { title: 1, summary: 1, body: 1 });
    if (!product) {
        return res.status(404).render('404');
    }
    res.render('update-product', { product: product, category: category });
});

router.post('/products', async function (req, res) {
    //res.render('notes-list');
    const categoryId = new ObjectId(req.body.category);
    const category = await db.getDb().collection('category').findOne({ _id: categoryId });
    console.log(category.name, category)
    const newNote = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        date: new Date(),
        category: {
            id: category._id,
            name: category.name
        }
    };
    const result = await db.getDb().collection('products').insertOne(newNote);
    console.log("Sending New Note: ", result)
    res.redirect('/');
});

router.post('/product/:id/edit', async function (req, res) {
    const noteId = new ObjectId(req.params.id);
    const categoryId = new ObjectId(req.body.category);
    const category = await db.getDb().collection('category').findOne({ _id: categoryId });
    const result = await db
        .getDb()
        .collection('products')
        .updateOne(
            { _id: noteId },
            {
                $set: {
                    name: req.body.name,
                    price: req.body.price,
                    stock: req.body.stock,
                    date: new Date(),
                    category: {
                        id: category._id,
                        name: category.name
                    }
                },
            });
    res.redirect('/');
});

router.post('/products/:id/delete', async function (req, res) {
    const productId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('products').deleteOne({ _id: productId });
    res.redirect('/');
});

router.get('/new-category', async function (req, res) {
    const category = await db.getDb().collection('category').find().toArray();
    res.render('create-category', { category: category, title: "Categories" });
});

router.post('/add-category', async function (req, res) {
    const newCategory = {
        name: req.body.category
    };
    const result = await db.getDb().collection('category').insertOne(newCategory);
    console.log("Sending New Category")
    res.redirect('/new-category');
});

router.post('/cat/:id/delete', async function (req, res) {
    const catId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('category').deleteOne({ _id: catId });
    res.redirect('/new-category');
});

module.exports = router;
