
const db = require('../config/db');

class Gallery {
  static async getAlbums() {
    const [rows] = await db.execute('SELECT DISTINCT album FROM gallery');
    return rows.map(r => r.album);
  }

  static async getImagesByAlbum(album) {
    const [rows] = await db.execute('SELECT * FROM gallery WHERE album = ? ORDER BY created_at DESC', [album]);
    return rows;
  }

  static async getAllImages() {
    const [rows] = await db.execute('SELECT * FROM gallery ORDER BY album, created_at DESC');
    return rows;
  }

  static async uploadImage(data) {
    const { image_path, album } = data;
    const [result] = await db.execute(`
      INSERT INTO gallery (image_path, album)
      VALUES (?, ?)
    `, [image_path, album]);
    const [rows] = await db.execute('SELECT * FROM gallery WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async deleteImage(id) {
    await db.execute('DELETE FROM gallery WHERE id = ?', [id]);
  }
}

module.exports = Gallery;
