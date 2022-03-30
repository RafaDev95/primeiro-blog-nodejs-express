const express = require('express');
const router = express.Router();
const Category = require('./Category');
const slugify = require('slugify');
const { render } = require('ejs');
const Auth = require('../middlewares/Auth');

router.get('/admin/categories/new', Auth, (req, res) => {
  res.render('admin/categories/new');
});

router.post('/categories/save', Auth, (req, res) => {
  const title = req.body.title;
  if (title) {
    Category.create({
      title,
      slug: slugify(title),
    }).then(() => res.redirect('/admin/categories'));
  } else {
    res.redirect('/admin/categories/new');
  }
});

router.get('/admin/categories', Auth, (req, res) => {
  Category.findAll().then((categories) => {
    res.render('admin/categories/index', { categories });
  });
});

//Delete category

router.post('/categories/delete', Auth, (req, res) => {
  const id = req.body.id;
  Category.destroy({
    where: {
      id,
    },
  }).then(() => res.redirect('/admin/categories'));
});

//Edit category

router.post('/admin/categories/edit/:id', Auth, (req, res) => {
  const id = req.params.id;
  Category.findByPk(id).then((category) => {
    if (category) {
      res.render('admin/categories/edit', { category });
    }
    res.redirect('/admin/categories');
  });
});

router.post('/admin/categories/update', Auth, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;

  Category.update(
    { title, slug: slugify(title) },
    {
      where: { id },
    }
  ).then(() => res.redirect('/admin/categories'));
});

module.exports = router;
