const express = require('express');
const { default: slugify } = require('slugify');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const Auth = require('../middlewares/Auth');

router.get('/admin/articles', Auth, (req, res) => {
  Article.findAll({ include: [{ model: Category }] }).then((articles) => {
    Category.findAll().then((categories) => {
      res.render('admin/articles/index', { articles, categories });
    });
  });
});

router.get('/admin/articles/new', Auth, (req, res) => {
  Category.findAll().then((categories) => {
    res.render('admin/articles/new', { categories });
  });
});

router.post('/articles/save', Auth, (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const category = req.body.category;

  Article.create({
    title,
    slug: slugify(title),
    body,
    categoryId: category,
  })
    .then(() => res.redirect('/admin/articles'))
    .catch((error) => console.log(error, 'erro ao salvar o artigo'));
});

router.post('/articles/delete', Auth, (req, res) => {
  const id = req.body.id;
  Article.destroy({
    where: {
      id,
    },
  }).then(() => res.redirect('/admin/articles'));
});

router.post('/admin/articles/edit/:id', Auth, (req, res) => {
  const id = req.params.id;
  Article.findByPk(id)
    .then((article) => {
      Category.findAll().then((categories) => {
        res.render('admin/articles/edit', { article, categories });
      });
    })
    .catch((error) => console.log(error, 'erro ao ver artigo'));
});

router.post('/article/update', Auth, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const body = req.body.body;
  const category = req.body.category;

  Article.update(
    {
      title,
      body,
      categoryId: category,
      id,
      slug: slugify(title),
    },
    { where: { id } }
  )
    .then(res.redirect('/admin/articles'))
    .catch(
      (error) => console.log('Erro ao atualizar artigo', error),
      res.redirect('/')
    );
});

router.get('/articles/page/:num', (req, res) => {
  const page = req.params.num;
  let offset = 0;

  if (isNaN(page) || page === 1) {
    offset = 0;
  } else {
    offset = parseInt(page) * 4;
  }

  Article.findAndCountAll({
    limit: 4,
    offset,
    order: [['createdAt', 'DESC']],
  }).then((articles) => {
    let next;

    if (offset + 4 >= articles.count) {
      next = false;
    } else {
      next = true;
    }

    const result = { next, articles, page: parseInt(page) };

    Category.findAll().then((categories) => {
      res.render('admin/articles/page', { result, categories });
    });
  });
});

module.exports = router;
