const mongoose = require('mongoose');
const LivroSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  ano: Number,
  status: { type: String, default: 'disponível' },
});
module.exports = mongoose.model('Livro', LivroSchema);
