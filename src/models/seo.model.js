
const db = require('../config/db');

class SEO {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM seo');
    return rows;
  }

  static async getByPage(page) {
    const [rows] = await db.execute('SELECT * FROM seo WHERE page = ?', [page]);
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM seo WHERE id = ?', [id]);
    return rows[0];
  }

  static async createOrUpdate(page, data) {
    const { page_title, meta_description, keywords, favicon, og_title, og_description, og_image } = data;

    // Check if exists
    const [existing] = await db.execute('SELECT id FROM seo WHERE page = ?', [page]);
    
    if (existing.length > 0) {
      await db.execute(`
        UPDATE seo 
        SET 
          page_title = COALESCE(?, page_title),
          meta_description = COALESCE(?, meta_description),
          keywords = COALESCE(?, keywords),
          favicon = COALESCE(?, favicon),
          og_title = COALESCE(?, og_title),
          og_description = COALESCE(?, og_description),
          og_image = COALESCE(?, og_image),
          updated_at = NOW()
        WHERE id = ?
      `, [page_title, meta_description, keywords, favicon, og_title, og_description, og_image, existing[0].id]);
      return this.getById(existing[0].id);
    } else {
      const [result] = await db.execute(`
        INSERT INTO seo (page, page_title, meta_description, keywords, favicon, og_title, og_description, og_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [page, page_title, meta_description, keywords, favicon, og_title, og_description, og_image]);
      return this.getById(result.insertId);
    }
  }
}

module.exports = SEO;
