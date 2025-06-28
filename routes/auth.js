const router = require('express').Router();
const User = require('c:/Users/IsraelPassos/Desktop/Nova pasta/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = router;

