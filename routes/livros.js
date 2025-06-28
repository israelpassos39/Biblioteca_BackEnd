const router = require('express').Router();
const Livro = require('c:/Users/IsraelPassos/Desktop/Nova pasta/models/Livro');

router.get('/', async (req, res) => {
  const livros = await Livro.find();
  res.json(livros);
});

router.post('/', async (req, res) => {
  const livro = new Livro(req.body);
  await livro.save();
  res.status(201).json(livro);
});

router.put('/:id', async (req, res) => {
  const livro = await Livro.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(livro);
});

router.delete('/:id', async (req, res) => {
  await Livro.findByIdAndDelete(req.params.id);
  res.send('Removido com sucesso');
});

module.exports = router;
