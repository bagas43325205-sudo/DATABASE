const express = require('express');
const mongoose = require('mongoose');
const libraryRoutes = require('./routes/libraryRoutes');

const app = express();
app.use(express.json());

// Menggunakan koneksi MongoDB lokal
mongoose.connect('mongodb://localhost:27017/perpustakaan_db')
  .then(() => console.log('Sukses terhubung ke Database Perpustakaan MongoDB'))
  .catch(err => console.error('Koneksi database gagal:', err));

// Registrasi endpoint routing
app.use('/api', libraryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan lancar pada port ${PORT}`);
});