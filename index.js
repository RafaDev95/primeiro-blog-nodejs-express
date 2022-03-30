const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const categoriesController = require('./categories/CategoriesController');
const articleController = require('./articles/ArticleController');
const userController = require('./users/UserController');

const Article = require('./articles/Article');
const Category = require('./categories/Category');
const User = require('./users/User');

const connection = require('./database/connection');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static('public'));

app.use(
  session({
    secret: 'uma_palavra_muito_secreta',
    cookie: { maxAge: 30000 },
  })
);

app.use('/', categoriesController);
app.use('/', articleController);
app.use('/', userController);

connection
  .authenticate()
  .then(() => console.log('Conexão foi bem sucedida'))
  .catch((error) => console.log('Erro ao conectar ao banco de dados', error));

app.listen(8000, () => {
  console.log('Servidor iniciado com sucesso');
});

app.get('/', (req, res) => {
  const session = req.session.user;
  Article.findAll({ order: [['createdAt', 'DESC']], limit: 4 })
    .then((articles) => {
      Category.findAll().then((categories) => {
        res.render('index', { articles, categories, session });
      });
    })
    .catch((error) => console.log(error, 'Erro ao filtrar os artigos'));
});

app.get('/:slug', (req, res) => {
  const slug = req.params.slug;

  Article.findOne({
    where: {
      slug,
    },
  })
    .then((article) => {
      Category.findAll().then((categories) => {
        res.render('article', { article, categories });
      });
    })
    .catch((error) => console.log(error, 'Erro ao buscar Slug do artigo'));
});

app.get('/category/:slug', (req, res) => {
  const slug = req.params.slug;
  Category.findOne({
    where: {
      slug,
    },
    include: [{ model: Article }],
  })
    .then((category) => {
      if (category) {
        Category.findAll().then((categories) => {
          res.render('index', { articles: category.articles, categories });
        });
      } else {
        res.redirect('/');
      }
    })
    .catch((error) => res.redirect('/'));
});
