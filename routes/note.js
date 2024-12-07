const express = require('express');
const mongodb = require('mongodb');
const db = require('../data/database');
const ObjectId = mongodb.ObjectId;
const router = express.Router();

router.get('/', async function (req, res) {
    const notes = await db
        .getDb()
        .collection('notes')
        .find({}, { title: 1, summary: 1, 'category.name': 1 })
        .toArray();
    let notesSorted = notes.reverse();
    res.render('home', { notes: notesSorted })
});

router.get('/new-note', async function (req, res) {
    const category = await db.getDb().collection('category').find().toArray();
    res.render('create-note', { category: category });
});

router.get('/note/:id', async function (req, res) {
    const noteId = req.params.id;
    const note = await db.getDb().collection('notes').findOne({
        _id: new
        ObjectId(noteId)
    }, { summary: 0 });
    if (!note) {
        return res.status(404).render('404');
    }
    note.humanReadableDate = note.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    res.render('note-detail', { note: note });
});

router.get('/note/:id/edit', async function (req, res) {
    const category = await db.getDb().collection('category').find().toArray();
    const noteId = req.params.id;
    const note = await db
    .getDb()
    .collection('notes')
    .findOne({ _id: new ObjectId(noteId) }, { title: 1, summary: 1, body: 1 });
    if (!note) {
        return res.status(404).render('404');
    }
    res.render('update-note', { note: note, category: category });
});

router.post('/notes', async function (req, res) {
    //res.render('notes-list');
    const categoryId = new ObjectId(req.body.category);
    const category = await db.getDb().collection('category').findOne({ _id: categoryId });
    const newNote = {
        title: req.body.title,
        content: req.body.content,
        date: new Date(),
        category: {
            id: categoryId,
            name: category.name
        }
    };
    const result = await db.getDb().collection('notes').insertOne(newNote);
    console.log("Sending New Note")
    res.redirect('/');
});

router.post('/notes/:id/edit', async function (req, res) {
    const noteId = new ObjectId(req.params.id);
    const categoryId = new ObjectId(req.body.category);
    const category = await db.getDb().collection('category').findOne({ _id: categoryId });
    const result = await db
        .getDb()
        .collection('notes')
        .updateOne(
            { _id: noteId },
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content,
                    date: new Date(),
                    category: {
                        id: category._id,
                        name: category.name
                    }
                },
            });
    res.redirect('/');
});

router.post('/notes/:id/delete', async function (req, res) {
    const noteId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('notes').deleteOne({ _id: noteId });
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
