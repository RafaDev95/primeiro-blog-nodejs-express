const express = require('express');
const router = express.Router();
const User = require('./User');
const bcrypt = require('bcryptjs');
const Category = require('../categories/Category');

router.get('/admin/users', (req, res) => {
  User.findAll().then((users) => {
    Category.findAll().then((categories) => {
      res.render('admin/users/index', { users, categories });
    });
  });
});

router.get('/admin/users/create', (req, res) => {
  res.render('admin/users/create');
});

router.post('/users/create', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        User.create({ email, password: hash, username })
          .then(() => res.redirect('/login'))
          .catch(
            (error) => console.log('Erro ao criar usuário', error),
            res.redirect('/login')
          );
      } else {
        res.redirect('/admin/users/create');
      }
    })
    .catch((error) => console.log(error));
});

router.get('/login', (req, res) => {
  res.render('admin/users/login');
});

router.post('/authenticate', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email } }).then((user) => {
    if (user) {
      const verificedPassword = bcrypt.compareSync(password, user.password);

      if (verificedPassword) {
        req.session.user = {
          id: user.id,
          email: user.email,
        };

        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.user = undefined;
  res.redirect('/');
});

module.exports = router;
