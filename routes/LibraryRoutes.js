const express = require('express');
const router = express.Router();
const { Member, Book, Loan } = require('../models/Library');

// 1) POST /api/members - Tambah anggota [cite: 580]
router.post('/members', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const newMember = new Member({ name, address, phone });
    await newMember.save();
    res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan', data: newMember });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2) POST /api/books - Tambah buku [cite: 581]
router.post('/books', async (req, res) => {
  try {
    const { title, author, year, stock } = req.body;
    const newBook = new Book({ title, author, year, stock });
    await newBook.save();
    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: newBook });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3) POST /api/loans - Peminjaman baru (mengurangi stok buku) [cite: 582]
router.post('/loans', async (req, res) => {
  try {
    const { memberId, bookId } = req.body;

    // Cek ketersediaan buku dan anggota
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    if (book.stock < 1) return res.status(400).json({ success: false, message: 'Stok buku habis!' });

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });

    // Kurangi stok buku
    book.stock -= 1;
    await book.save();

    // Buat data peminjaman
    const newLoan = new Loan({ member: memberId, book: bookId, status: 'borrowed' });
    await newLoan.save();

    res.status(201).json({ success: true, message: 'Peminjaman berhasil dicatat', data: newLoan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4) POST /api/loans/:id/return - Pengembalian buku (menambah stok kembali) [cite: 583]
router.post('/loans/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
    if (loan.status === 'returned') return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan sebelumnya' });

    // Kembalikan stok buku
    const book = await Book.findById(loan.book);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    // Update status peminjaman
    loan.status = 'returned';
    loan.returnDate = new Date();
    await loan.save();

    res.json({ success: true, message: 'Buku berhasil dikembalikan', data: loan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5) GET /api/members/:id/loans - Daftar peminjaman anggota (dengan populate buku) [cite: 584]
router.get('/members/:id/loans', async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.params.id })
      .populate('book') // Mengganti ID buku dengan dokumen info lengkap buku [cite: 584]
      .sort({ loanDate: -1 });

    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6) GET /api/books - Daftar buku yang stoknya habis / pencarian berdasarkan query stock [cite: 585]
router.get('/books', async (req, res) => {
  try {
    // Menangkap query params ?stock=0
    const stockQuery = req.query.stock;
    let filter = {};
    if (stockQuery !== undefined) {
      filter.stock = Number(stockQuery);
    }

    const books = await Book.find(filter);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;