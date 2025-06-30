// backend/routes/auth.js
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  const user = new User({ nome, email, senha: hash });
  await user.save();
  res.status(201).send('Usuário criado');
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('Usuário não encontrado');

  const match = await bcrypt.compare(senha, user.senha);
  if (!match) return res.status(401).send('Senha inválida');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { nome: user.nome, email: user.email } });
});


router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('Usuário não encontrado');

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.expiraToken = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_REMETENTE,
      pass: process.env.EMAIL_SENHA_APP
    }
  });

  await transporter.sendMail({
    from: `"Biblioteca" <${process.env.EMAIL_REMETENTE}>`,
    to: email,
    subject: 'Redefinição de senha',
    html: `<p>Redefina sua senha clicando <a href="${process.env.FRONTEND_URL}/redefinir/${token}">aqui</a></p>`
  });

  res.send('Email enviado');
});

router.post('/redefinir-senha/:token', async (req, res) => {
  const { token } = req.params;
  const { senha } = req.body;

  const user = await User.findOne({ resetToken: token, expiraToken: { $gt: Date.now() } });
  if (!user) return res.status(400).send('Token inválido ou expirado');

  const hash = await bcrypt.hash(senha, 10);
  user.senha = hash;
  user.resetToken = undefined;
  user.expiraToken = undefined;
  await user.save();

  res.send('Senha redefinida com sucesso');
});

module.exports = router;