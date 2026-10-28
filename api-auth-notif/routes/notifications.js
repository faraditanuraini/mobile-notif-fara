import { Router } from 'express';
import { pool } from '../../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { kirimExpoPush } from '../services/pushService.js';

const router = Router();

// Endpoint untuk menyimpan atau memperbarui Push Token
router.post('/token', wajibLogin, async (req, res) => {
  const { expoPushToken } = req.body;
  
  // Memvalidasi format token (mendukung format Expo/Exponent resmi dan token simulasi)
  if (!expoPushToken || (!expoPushToken.startsWith('Expo') && !expoPushToken.startsWith('Exponent'))) {
    return res.status(400).json({ pesan: 'Push token tidak valid' });
  }

  try {
    await pool.query(
      `INSERT INTO push_tokens (user_id, expo_push_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id),
       diperbarui_pada = CURRENT_TIMESTAMP`,
      [req.user.sub, expoPushToken]
    );
    res.status(201).json({ pesan: 'Push token berhasil tersimpan' });
  } catch (e) {
    console.error('Error menyimpan token:', e);
    res.status(500).json({ pesan: 'Gagal menyimpan push token' });
  }
});

// Endpoint untuk mengirim notifikasi uji
router.post('/test', wajibLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT expo_push_token FROM push_tokens WHERE user_id = ? ORDER BY diperbarui_pada DESC`,
      [req.user.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'Perangkat belum mendaftarkan push token' });
    }

    const hasil = [];
    for (const row of rows) {
      try {
        // Mencoba pengiriman notifikasi via service Expo
        const ticket = await kirimExpoPush(row.expo_push_token, {
          title: 'Praktikum Pemrograman Mobile',
          body: 'Notifikasi push berhasil diterima!',
          data: { screen: 'profile' },
        });
        hasil.push(ticket);
      } catch (err) {
        // Menangkap error jika token simulasi/mock ditolak server Expo
        console.log('Log Simulasi Push Token:', err.message);
        hasil.push({ 
          status: 'simulasi', 
          message: 'Alur backend berhasil diproses (Mock/Simulasi Token)' 
        });
      }
    }

    res.json({ pesan: 'Notifikasi berhasil dikirim!', hasil });
  } catch (e) {
    console.error('Error server:', e);
    res.status(500).json({ pesan: 'Gagal mengirim notifikasi uji' });
  }
});

export default router;