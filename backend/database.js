// DATABASE SETUP - SQLite for Blog System
// Add this to your server.js or create a separate db.js file

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✓ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Blog posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image TEXT,
        author TEXT DEFAULT 'Admin',
        category TEXT DEFAULT 'General',
        status TEXT DEFAULT 'published',
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating blog_posts table:', err.message);
      } else {
        console.log('✓ Blog posts table ready');
      }
    });

    // Blog tags table
    db.run(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating blog_tags table:', err.message);
      } else {
        console.log('✓ Blog tags table ready');
      }
    });

    // Post-tags junction table
    db.run(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER,
        tag_id INTEGER,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating post_tags table:', err.message);
      } else {
        console.log('✓ Post tags junction table ready');
      }
    });

    // Activity logs table (for admin panel)
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        metadata TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating activity_logs table:', err.message);
      } else {
        console.log('✓ Activity logs table ready');
      }
    });

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)');
    db.run('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type)');
    db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)');
    
    console.log('✓ Database indexes created');
  });
}

// Helper function to run queries with promises
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper function to get single row
function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get all rows
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Log activity to database
async function logActivityToDB(data) {
  try {
    const query = `
      INSERT INTO activity_logs (type, action, user_id, ip_address, user_agent, metadata, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const metadata = JSON.stringify({
      ...data,
      type: undefined,
      action: undefined,
      ip: undefined,
      userAgent: undefined,
      status: undefined,
    });
    
    await dbRun(query, [
      data.type,
      data.action,
      data.userId || null,
      data.ip || null,
      data.userAgent || null,
      metadata,
      data.status || 'success'
    ]);
  } catch (error) {
    console.error('Error logging activity to database:', error.message);
  }
}

// Get activity logs from database
async function getActivityLogsFromDB(options = {}) {
  const {
    page = 1,
    limit = 50,
    type,
    action,
    status,
  } = options;

  let query = 'SELECT * FROM activity_logs WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (action) {
    query += ' AND action = ?';
    params.push(action);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const logs = await dbAll(query, params);
  
  // Parse metadata JSON
  const parsedLogs = logs.map(log => ({
    ...log,
    metadata: log.metadata ? JSON.parse(log.metadata) : {},
    timestamp: log.created_at,
  }));

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
  const countParams = [];
  
  if (type) {
    countQuery += ' AND type = ?';
    countParams.push(type);
  }
  if (action) {
    countQuery += ' AND action = ?';
    countParams.push(action);
  }
  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }

  const { total } = await dbGet(countQuery, countParams);

  return {
    logs: parsedLogs,
    total: total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
}

// Get statistics from database
async function getStatsFromDB() {
  const now = new Date();
  const last24Hours = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Total stats
  const totalConversions = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'conversion'");
  const totalDownloads = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'download'");
  const totalUploads = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'upload'");
  const totalErrors = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE status IN ('error', 'failed')");
  const totalSecurity = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'security_incident'");

  // Last 24 hours
  const conversions24h = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'conversion' AND created_at > ?", [last24Hours]);
  const downloads24h = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'download' AND created_at > ?", [last24Hours]);
  const uploads24h = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'upload' AND created_at > ?", [last24Hours]);
  const errors24h = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE status IN ('error', 'failed') AND created_at > ?", [last24Hours]);

  // Last 7 days
  const conversions7d = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'conversion' AND created_at > ?", [last7Days]);
  const downloads7d = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'download' AND created_at > ?", [last7Days]);
  const uploads7d = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE type = 'upload' AND created_at > ?", [last7Days]);
  const errors7d = await dbGet("SELECT COUNT(*) as count FROM activity_logs WHERE status IN ('error', 'failed') AND created_at > ?", [last7Days]);

  // Popular tools (from metadata)
  const popularTools = await dbAll(`
    SELECT 
      json_extract(metadata, '$.tool') as tool,
      COUNT(*) as count
    FROM activity_logs
    WHERE json_extract(metadata, '$.tool') IS NOT NULL
    GROUP BY tool
    ORDER BY count DESC
    LIMIT 10
  `);

  // Errors by type
  const errorsByType = await dbAll(`
    SELECT 
      json_extract(metadata, '$.error') as error_type,
      COUNT(*) as count
    FROM activity_logs
    WHERE status IN ('error', 'failed')
    AND json_extract(metadata, '$.error') IS NOT NULL
    GROUP BY error_type
    LIMIT 10
  `);

  const stats = {
    total: {
      conversions: totalConversions.count,
      downloads: totalDownloads.count,
      uploads: totalUploads.count,
      errors: totalErrors.count,
      securityIncidents: totalSecurity.count,
    },
    last24Hours: {
      conversions: conversions24h.count,
      downloads: downloads24h.count,
      uploads: uploads24h.count,
      errors: errors24h.count,
    },
    last7Days: {
      conversions: conversions7d.count,
      downloads: downloads7d.count,
      uploads: uploads7d.count,
      errors: errors7d.count,
    },
    popularTools: popularTools.reduce((acc, row) => {
      if (row.tool) acc[row.tool] = row.count;
      return acc;
    }, {}),
    errorsByType: errorsByType.reduce((acc, row) => {
      if (row.error_type) {
        const errorName = row.error_type.split(':')[0] || 'Unknown';
        acc[errorName] = row.count;
      }
      return acc;
    }, {}),
  };

  return stats;
}

// Export database and helper functions
module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  logActivityToDB,
  getActivityLogsFromDB,
  getStatsFromDB,
};