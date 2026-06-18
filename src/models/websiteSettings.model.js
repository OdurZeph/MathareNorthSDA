
const db = require('../config/db');

class WebsiteSettings {
  static async getSettings() {
    const [rows] = await db.execute(`
      SELECT * FROM website_settings 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    return rows[0];
  }

  static async updateSettings(data) {
    const {
      hero_title, hero_subtitle, welcome_message, mission_statement, 
      vision_statement, pastors_message, footer_text, phone, email, 
      address, google_maps_embed, facebook_link, twitter_link, instagram_link, 
      youtube_link, paybill_number, till_number, account_names, donation_categories
    } = data;

    // First, check if settings exist
    const [existing] = await db.execute('SELECT id FROM website_settings LIMIT 1');
    
    if (existing.length > 0) {
      // Update existing
      await db.execute(`
        UPDATE website_settings 
        SET 
          hero_title = COALESCE(?, hero_title),
          hero_subtitle = COALESCE(?, hero_subtitle),
          welcome_message = COALESCE(?, welcome_message),
          mission_statement = COALESCE(?, mission_statement),
          vision_statement = COALESCE(?, vision_statement),
          pastors_message = COALESCE(?, pastors_message),
          footer_text = COALESCE(?, footer_text),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          google_maps_embed = COALESCE(?, google_maps_embed),
          facebook_link = COALESCE(?, facebook_link),
          twitter_link = COALESCE(?, twitter_link),
          instagram_link = COALESCE(?, instagram_link),
          youtube_link = COALESCE(?, youtube_link),
          paybill_number = COALESCE(?, paybill_number),
          till_number = COALESCE(?, till_number),
          account_names = COALESCE(?, account_names),
          donation_categories = COALESCE(?, donation_categories),
          updated_at = NOW()
        WHERE id = ?
      `, [
        hero_title, hero_subtitle, welcome_message, mission_statement, 
        vision_statement, pastors_message, footer_text, phone, email, 
        address, google_maps_embed, facebook_link, twitter_link, instagram_link, 
        youtube_link, paybill_number, till_number, account_names, donation_categories,
        existing[0].id
      ]);
      
      return this.getSettings();
    } else {
      // Create new
      const [result] = await db.execute(`
        INSERT INTO website_settings (
          hero_title, hero_subtitle, welcome_message, mission_statement, 
          vision_statement, pastors_message, footer_text, phone, email, 
          address, google_maps_embed, facebook_link, twitter_link, instagram_link, 
          youtube_link, paybill_number, till_number, account_names, donation_categories
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        hero_title, hero_subtitle, welcome_message, mission_statement, 
        vision_statement, pastors_message, footer_text, phone, email, 
        address, google_maps_embed, facebook_link, twitter_link, instagram_link, 
        youtube_link, paybill_number, till_number, account_names, donation_categories
      ]);
      
      const [newSettings] = await db.execute('SELECT * FROM website_settings WHERE id = ?', [result.insertId]);
      return newSettings[0];
    }
  }
}

module.exports = WebsiteSettings;
