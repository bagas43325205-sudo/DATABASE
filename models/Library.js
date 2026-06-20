const mongoose = require('mongoose');

// Schema Anggota [cite: 572]
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  joinDate: { type: Date, default: Date.now }
});

// Schema Buku [cite: 573]
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  stock: { type: Number, default: 0, min: 0 }
});

// Schema Peminjaman (Menyimpan referensi ke Anggota dan Buku) [cite: 574, 578]
const loanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  }, // One-to-Many Reference [cite: 576]
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }, // One-to-Many Reference [cite: 577]
  loanDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  status: {
    type: String,
    enum: ['borrowed', 'returned'],
    default: 'borrowed'
  }
});

module.exports = {
  Member: mongoose.model('Member', memberSchema),
  Book: mongoose.model('Book', bookSchema),
  Loan: mongoose.model('Loan', loanSchema)
};