// server.js - Express Backend with Admin Panel, Activity Tracking & File Validation
const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const { exec } = require("child_process")
const util = require("util")
const execPromise = util.promisify(exec)
const archiver = require("archiver")
const PDFDocument = require("pdfkit")
const { PDFDocument: PDFLibDocument } = require("pdf-lib")
const sizeOf = require("image-size")
const sharp = require("sharp")
const pdfParse = require('pdf-parse')
const { Document, Packer, Paragraph, TextRun } = require("docx")
const crypto = require("crypto")
const { 
  db, 
  dbRun, 
  dbGet, 
  dbAll, 
  logActivityToDB,
  getActivityLogsFromDB,
  getStatsFromDB 
} = require('./database')


const app = express()
const PORT = process.env.PORT || 5011

// Admin credentials (CHANGE THESE IN PRODUCTION!)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"


// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
})

// Multer configuration for blog images
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/blog"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})

const blogImageUpload = multer({
  storage: blogImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."))
    }
  },
})
// ============================================
// HELPER FUNCTIONS
// ============================================

// Activity logging
async function logActivity(data) {
  await logActivityToDB(data);
}

// Password hashing
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}
// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Manage blog tags
async function manageTags(tags) {
  const tagIds = []
  
  for (const tagName of tags) {
    let tag = await dbGet('SELECT id FROM blog_tags WHERE name = ?', [tagName.toLowerCase()])
    
    if (!tag) {
      const result = await dbRun('INSERT INTO blog_tags (name) VALUES (?)', [tagName.toLowerCase()])
      tagIds.push(result.id)
    } else {
      tagIds.push(tag.id)
    }
  }
  
  return tagIds
}

// Get post with tags
async function getPostWithTags(post) {
  const tags = await dbAll(`
    SELECT bt.name 
    FROM blog_tags bt
    JOIN post_tags pt ON bt.id = pt.tag_id
    WHERE pt.post_id = ?
  `, [post.id])
  
  return {
    ...post,
    tags: tags.map(t => t.name)
  }
}
// File validation middleware
const fileValidation = (req, res, next) => {
  if (!req.files && !req.file) {
    return next()
  }

  const files = req.files || [req.file]
  const validationErrors = []

  for (const file of files) {
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      validationErrors.push({
        file: file.originalname,
        error: "File size exceeds 100MB limit",
      })
      continue
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExtensions = [
      ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp",
    ]

    if (!allowedExtensions.includes(ext)) {
      validationErrors.push({
        file: file.originalname,
        error: `Invalid file type: ${ext}`,
      })
      continue
    }

    // Check MIME type
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/webp",
    ]

    if (!allowedMimeTypes.includes(file.mimetype)) {
      validationErrors.push({
        file: file.originalname,
        error: `Invalid MIME type: ${file.mimetype}`,
      })
      continue
    }

    // Check for executable signatures (basic malware detection)
    try {
      const fileBuffer = fs.readFileSync(file.path)
      const header = fileBuffer.slice(0, 4).toString("hex")

      // Check for executable signatures
      const executableSignatures = [
        "4d5a9000", // EXE
        "7f454c46", // ELF
        "cafebabe", // Mach-O
        "feedface", // Mach-O
      ]

      if (executableSignatures.some((sig) => header.startsWith(sig))) {
        validationErrors.push({
          file: file.originalname,
          error: "Executable file detected - blocked for security",
        })

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        continue
      }

      // Verify file header matches extension
      const fileSignatures = {
        pdf: ["25504446"], // %PDF
        png: ["89504e47"], // PNG signature
        jpg: ["ffd8ffe0", "ffd8ffe1", "ffd8ffdb"], // JPEG signatures
        webp: ["52494646"], // RIFF (WEBP)
      }

      const detectedType = Object.keys(fileSignatures).find((type) =>
        fileSignatures[type].some((sig) => header.startsWith(sig))
      )

      if (detectedType && !ext.includes(detectedType)) {
        validationErrors.push({
          file: file.originalname,
          error: `File extension mismatch: claims to be ${ext} but appears to be ${detectedType}`,
        })

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        continue
      }
    } catch (validationError) {
      console.error("File validation error:", validationError)
    }
  }

  if (validationErrors.length > 0) {
    logActivity({
      type: "security_incident",
      action: "file_validation_failed",
      ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      errors: validationErrors,
      status: "blocked",
    })

    return res.status(400).json({
      error: "File validation failed",
      details: validationErrors,
    })
  }

  next()
}

// Admin authentication middleware
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [username, passwordHash] = decoded.split(":")

    if (username === ADMIN_USERNAME && passwordHash === hashPassword(ADMIN_PASSWORD)) {
      next()
    } else {
      res.status(401).json({ error: "Invalid credentials" })
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Find LibreOffice executable
function getLibreOfficePath() {
  const possiblePaths = [
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    "/usr/bin/soffice",
    "/usr/bin/libreoffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }

  return "soffice"
}

// Find Ghostscript executable
function getGhostscriptPath() {
  const possiblePaths = [
    "C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.03.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.02.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.01.2\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.01.1\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.01.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs10.00.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs9.56.1\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs9.55.0\\bin\\gswin64c.exe",
    "C:\\Program Files\\gs\\gs9.54.0\\bin\\gswin64c.exe",
    "C:\\Program Files (x86)\\gs\\gs10.04.0\\bin\\gswin32c.exe",
    "C:\\Program Files (x86)\\gs\\gs10.03.1\\bin\\gswin32c.exe",
    "C:\\Program Files (x86)\\gs\\gs9.56.1\\bin\\gswin32c.exe",
    "/usr/bin/gs",
    "/usr/local/bin/gs",
    "/opt/homebrew/bin/gs",
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log("Found Ghostscript at:", p)
      return p
    }
  }

  return process.platform === "win32" ? "gswin64c" : "gs"
}

// Helper function for file size formatting
function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }
  return (bytes / 1024).toFixed(1) + " KB"
}

// ============================================
// ADMIN PANEL ROUTES
// ============================================

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${username}:${hashPassword(password)}`).toString("base64")

    await logActivity({
      type: "admin",
      action: "login",
      metadata: { username: username },
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.json({
      success: true,
      token: token,
      username: username,
    })
  } else {
    await logActivity({
      type: "admin",
      action: "login_failed",
      metadata: { username: username },
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "failed",
    })

    res.status(401).json({ error: "Invalid credentials" })
  }
})

// Get activity logs
app.get("/api/admin/activity", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, action, status } = req.query

    const result = await getActivityLogsFromDB({
      page,
      limit,
      type,
      action,
      status
    })

    const stats = {
      total: result.total,
      filtered: result.total,
      byType: {},
      byStatus: {},
      last24Hours: 0,
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    result.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
      
      if (log.status) {
        stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1
      }
      
      if (log.created_at > twentyFourHoursAgo) {
        stats.last24Hours++
      }
    })

    res.json({
      logs: result.logs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      stats: stats,
    })
  } catch (error) {
    console.error("Get activity logs error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get dashboard statistics
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const stats = await getStatsFromDB()
    
    const recentLogs = await getActivityLogsFromDB({ page: 1, limit: 10 })
    stats.recentActivity = recentLogs.logs

    res.json(stats)
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Clear old logs
app.post("/api/admin/clear-logs", adminAuth, async (req, res) => {
  try {
    const { olderThan } = req.body

    if (!olderThan) {
      return res.status(400).json({ error: "olderThan parameter required" })
    }

    const cutoffDate = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000).toISOString()

    const result = await dbRun('DELETE FROM activity_logs WHERE created_at < ?', [cutoffDate])

    await logActivity({
      type: "admin",
      action: "clear_logs",
      metadata: {
        logsRemoved: result.changes,
        olderThan: olderThan
      },
      status: "success",
    })

    res.json({
      success: true,
      message: `Removed ${result.changes} log entries`,
      removed: result.changes,
    })
  } catch (error) {
    console.error("Clear logs error:", error)
    res.status(500).json({ error: error.message })
  }
})
// EXISTING ROUTES WITH ACTIVITY TRACKING

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" })
})

// BLOG ENDPOINTS (WITH DATABASE)

// Create blog post
app.post("/api/blog/create", adminAuth, blogImageUpload.single("featuredImage"), async (req, res) => {
  try {
    const { title, excerpt, content, author, category, tags, status } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const slug = generateSlug(title)
    
    const existingPost = await dbGet('SELECT id FROM blog_posts WHERE slug = ?', [slug])
    if (existingPost) {
      return res.status(400).json({ error: "A post with this title already exists" })
    }

    const result = await dbRun(`
      INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author, category, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      slug,
      excerpt || content.substring(0, 160) + "...",
      content,
      req.file ? `/uploads/blog/${req.file.filename}` : null,
      author || "Admin",
      category || "General",
      status || "published"
    ])

    const postId = result.id

    if (tags) {
      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t)
      const tagIds = await manageTags(tagArray)
      
      for (const tagId of tagIds) {
        await dbRun('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId])
      }
    }

    const newPost = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [postId])
    const postWithTags = await getPostWithTags(newPost)

    await logActivity({
      type: "admin",
      action: "blog_post_created",
      metadata: {
        postId: postId,
        title: title,
        status: status || "published"
      },
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.json({
      success: true,
      message: "Blog post created successfully",
      post: postWithTags,
    })
  } catch (error) {
    console.error("Create blog post error:", error)
    
    await logActivity({
      type: "admin",
      action: "blog_post_create_failed",
      metadata: { error: error.message },
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Get all blog posts (public)
app.get("/api/blog/posts", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, status = "published" } = req.query

    let query = 'SELECT * FROM blog_posts WHERE status = ?'
    const params = [status]

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    if (tag) {
      query += ` AND id IN (
        SELECT pt.post_id FROM post_tags pt
        JOIN blog_tags bt ON pt.tag_id = bt.id
        WHERE bt.name = ?
      )`
      params.push(tag.toLowerCase())
    }

    query += ' ORDER BY created_at DESC'

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total')
    const { total } = await dbGet(countQuery, params)

    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit))

    const posts = await dbAll(query, params)

    const postsWithTags = await Promise.all(posts.map(post => getPostWithTags(post)))

    const categories = await dbAll('SELECT DISTINCT category FROM blog_posts WHERE status = ?', [status])
    const allTags = await dbAll('SELECT name FROM blog_tags')

    res.json({
      success: true,
      posts: postsWithTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
      },
      categories: categories.map(c => c.category),
      tags: allTags.map(t => t.name),
    })
  } catch (error) {
    console.error("Get blog posts error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get single blog post by slug (public)
app.get("/api/blog/post/:slug", async (req, res) => {
  try {
    const { slug } = req.params
    
    const post = await dbGet('SELECT * FROM blog_posts WHERE slug = ?', [slug])

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" })
    }

    await dbRun('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [post.id])

    const postWithTags = await getPostWithTags(post)
    postWithTags.views += 1

    const relatedPosts = await dbAll(`
      SELECT * FROM blog_posts 
      WHERE category = ? AND id != ? AND status = 'published'
      ORDER BY created_at DESC
      LIMIT 3
    `, [post.category, post.id])

    const relatedWithTags = await Promise.all(relatedPosts.map(p => getPostWithTags(p)))

    res.json({
      success: true,
      post: postWithTags,
      relatedPosts: relatedWithTags,
    })
  } catch (error) {
    console.error("Get blog post error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Update blog post
app.put("/api/blog/update/:id", adminAuth, blogImageUpload.single("featuredImage"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, excerpt, content, author, category, tags, status } = req.body

    const post = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [id])

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" })
    }

    const updates = []
    const params = []

    if (title) {
      const slug = generateSlug(title)
      updates.push('title = ?', 'slug = ?')
      params.push(title, slug)
    }
    if (excerpt) {
      updates.push('excerpt = ?')
      params.push(excerpt)
    }
    if (content) {
      updates.push('content = ?')
      params.push(content)
    }
    if (author) {
      updates.push('author = ?')
      params.push(author)
    }
    if (category) {
      updates.push('category = ?')
      params.push(category)
    }
    if (status) {
      updates.push('status = ?')
      params.push(status)
    }
    if (req.file) {
      updates.push('featured_image = ?')
      params.push(`/uploads/blog/${req.file.filename}`)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    if (updates.length > 0) {
      await dbRun(`UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    if (tags) {
      await dbRun('DELETE FROM post_tags WHERE post_id = ?', [id])
      
      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t)
      const tagIds = await manageTags(tagArray)
      
      for (const tagId of tagIds) {
        await dbRun('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId])
      }
    }

    const updatedPost = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [id])
    const postWithTags = await getPostWithTags(updatedPost)

    await logActivity({
      type: "admin",
      action: "blog_post_updated",
      metadata: {
        postId: id,
        title: updatedPost.title
      },
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: "Blog post updated successfully",
      post: postWithTags,
    })
  } catch (error) {
    console.error("Update blog post error:", error)
    
    await logActivity({
      type: "admin",
      action: "blog_post_update_failed",
      metadata: { error: error.message },
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Delete blog post
app.delete("/api/blog/delete/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    
    const post = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [id])

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" })
    }

    if (post.featured_image) {
      const imagePath = path.join(__dirname, post.featured_image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await dbRun('DELETE FROM blog_posts WHERE id = ?', [id])

    await logActivity({
      type: "admin",
      action: "blog_post_deleted",
      metadata: {
        postId: id,
        title: post.title
      },
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    })
  } catch (error) {
    console.error("Delete blog post error:", error)
    
    await logActivity({
      type: "admin",
      action: "blog_post_delete_failed",
      metadata: { error: error.message },
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Get all posts for admin (includes drafts)
app.get("/api/blog/admin/posts", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const { total } = await dbGet('SELECT COUNT(*) as total FROM blog_posts')
    
    const posts = await dbAll(`
      SELECT * FROM blog_posts 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)])

    const postsWithTags = await Promise.all(posts.map(post => getPostWithTags(post)))

    res.json({
      success: true,
      posts: postsWithTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get admin blog posts error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Search blog posts
app.get("/api/blog/search", async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ error: "Search query required" })
    }

    const searchTerm = `%${q}%`
    
    const results = await dbAll(`
      SELECT * FROM blog_posts 
      WHERE status = 'published' 
      AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)
      ORDER BY created_at DESC
      LIMIT 50
    `, [searchTerm, searchTerm, searchTerm])

    const resultsWithTags = await Promise.all(results.map(post => getPostWithTags(post)))

    res.json({
      success: true,
      results: resultsWithTags,
      count: resultsWithTags.length,
    })
  } catch (error) {
    console.error("Search blog posts error:", error)
    res.status(500).json({ error: error.message })
  }
})
// Word to PDF Conversion
app.post("/api/word-to-pdf", upload.single("file"), fileValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    logActivity({
      type: "upload",
      action: "word_uploaded",
      tool: "word-to-pdf",
      filename: req.file.originalname,
      fileSize: req.file.size,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log("File received:", req.file.originalname)

    const inputPath = req.file.path
    const outputDir = path.dirname(inputPath)
    const outputFilename = req.file.filename.replace(/\.(doc|docx)$/i, ".pdf")
    const outputPath = path.join(outputDir, outputFilename)

    const libreOfficePath = getLibreOfficePath()

    const command = `"${libreOfficePath}" --headless --convert-to "pdf:writer_pdf_Export:{\\"ReduceImageResolution\\":false,\\"MaxImageResolution\\":600,\\"Quality\\":90,\\"EmbedStandardFonts\\":true}" --outdir "${outputDir}" "${inputPath}"`

    console.log("Converting with LibreOffice (High Quality Mode)...")

    try {
      await execPromise(command, {
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024,
      })

      const libreOutputPath = inputPath.replace(/\.(doc|docx)$/i, ".pdf")

      if (fs.existsSync(libreOutputPath)) {
        if (libreOutputPath !== outputPath) {
          fs.renameSync(libreOutputPath, outputPath)
        }

        console.log("Conversion successful:", outputFilename)
        fs.unlinkSync(inputPath)

        logActivity({
          type: "conversion",
          action: "word_to_pdf_complete",
          tool: "word-to-pdf",
          conversionType: "word-to-pdf",
          filename: req.file.originalname,
          ip: req.ip || req.headers["x-forwarded-for"],
          status: "success",
        })

        res.json({
          success: true,
          message: "File converted successfully with high quality",
          downloadUrl: `/uploads/${outputFilename}`,
          originalName: req.file.originalname,
          convertedName: outputFilename,
        })
      } else {
        throw new Error("PDF file not created")
      }
    } catch (conversionError) {
      console.error("LibreOffice conversion error:", conversionError)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "word_to_pdf_failed",
        tool: "word-to-pdf",
        filename: req.file.originalname,
        error: conversionError.message,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })

      res.status(500).json({
        error: "Conversion failed. Please ensure LibreOffice is installed and the document is not corrupted.",
        details: conversionError.message,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    
    logActivity({
      type: "conversion",
      action: "word_to_pdf_failed",
      tool: "word-to-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// PNG to PDF - FIXED VERSION
app.post("/api/png-to-pdf", upload.array("files", 50), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "png_uploaded",
      tool: "png-to-pdf",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`PNG to PDF - ${req.files.length} file(s) received`)

    const pageSize = req.body.pageSize || "a4"
    const orientation = req.body.orientation || "portrait"

    const outputFilename = `images-combined-${Date.now()}.pdf`
    const outputPath = path.join("./uploads", outputFilename)

    const pageSizes = {
      a4: { width: 595.28, height: 841.89 },
      letter: { width: 612, height: 792 },
      legal: { width: 612, height: 1008 },
    }

    const doc = new PDFDocument({
      autoFirstPage: false,
      margin: 0,
    })

    const writeStream = fs.createWriteStream(outputPath)
    doc.pipe(writeStream)

    let successCount = 0
    const errors = []

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]

      try {
        if (!fs.existsSync(file.path)) {
          throw new Error(`File not found: ${file.path}`)
        }

        let imgWidth, imgHeight
        
        try {
          const metadata = await sharp(file.path).metadata()
          imgWidth = metadata.width
          imgHeight = metadata.height
          console.log(`Sharp metadata for ${file.originalname}: ${imgWidth}x${imgHeight}`)
        } catch (sharpError) {
          console.log(`Sharp failed for ${file.originalname}, trying image-size...`)
          const dimensions = sizeOf(file.path)
          imgWidth = dimensions.width
          imgHeight = dimensions.height
          console.log(`image-size for ${file.originalname}: ${imgWidth}x${imgHeight}`)
        }

        if (!imgWidth || !imgHeight || imgWidth === 0 || imgHeight === 0) {
          throw new Error(`Invalid dimensions: ${imgWidth}x${imgHeight}`)
        }

        let pageWidth, pageHeight

        if (pageSize === "fit") {
          pageWidth = (imgWidth * 72) / 96
          pageHeight = (imgHeight * 72) / 96
        } else {
          const size = pageSizes[pageSize] || pageSizes.a4

          if (orientation === "auto") {
            const isLandscape = imgWidth > imgHeight
            pageWidth = isLandscape ? size.height : size.width
            pageHeight = isLandscape ? size.width : size.height
          } else if (orientation === "landscape") {
            pageWidth = size.height
            pageHeight = size.width
          } else {
            pageWidth = size.width
            pageHeight = size.height
          }
        }

        doc.addPage({ size: [pageWidth, pageHeight], margin: 0 })

        const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale

        const x = (pageWidth - scaledWidth) / 2
        const y = (pageHeight - scaledHeight) / 2

        const absolutePath = path.resolve(file.path)
        console.log(`Adding image to PDF: ${absolutePath}`)
        
        doc.image(absolutePath, x, y, { 
          width: scaledWidth, 
          height: scaledHeight,
          fit: [scaledWidth, scaledHeight],
          align: 'center',
          valign: 'center'
        })

        successCount++
        console.log(`✓ Added image ${successCount}/${req.files.length}: ${file.originalname}`)
      } catch (imgError) {
        console.error(`✗ Error processing image ${file.originalname}:`, imgError.message)
        errors.push({ file: file.originalname, error: imgError.message })
      }
    }

    if (successCount === 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
      
      logActivity({
        type: "conversion",
        action: "png_to_pdf_failed",
        tool: "png-to-pdf",
        error: "No valid images processed",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ 
        error: "No valid images were processed", 
        details: errors 
      })
    }

    doc.end()

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve)
      writeStream.on("error", reject)
    })

    console.log(`✓ PDF created successfully: ${outputFilename}`)
    console.log(`✓ Processed ${successCount}/${req.files.length} images`)

    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path)
        } catch (cleanupError) {
          console.log(`Warning: Could not delete ${file.path}`)
        }
      }
    }

    const stats = fs.statSync(outputPath)
    if (stats.size === 0) {
      logActivity({
        type: "conversion",
        action: "png_to_pdf_failed",
        tool: "png-to-pdf",
        error: "PDF file is empty",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ 
        error: "PDF file is empty", 
        details: "No content was written to PDF" 
      })
    }

    logActivity({
      type: "conversion",
      action: "png_to_pdf_complete",
      tool: "png-to-pdf",
      conversionType: "png-to-pdf",
      pageCount: successCount,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${successCount} image(s) combined into PDF successfully`,
      downloadUrl: `/uploads/${outputFilename}`,
      convertedName: outputFilename,
      pageCount: successCount,
      errors: errors.length > 0 ? errors : undefined,
      fileSize: stats.size,
    })
  } catch (error) {
    console.error("PNG to PDF Error:", error)
    console.error("Stack:", error.stack)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path)
          } catch (cleanupError) {
            console.log(`Warning: Could not delete ${file.path}`)
          }
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "png_to_pdf_failed",
      tool: "png-to-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({ 
      error: "Failed to create PDF",
      details: error.message 
    })
  }
})

// PNG to WEBP conversion endpoint
app.post("/api/png-to-webp", upload.array("files", 20), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "png_uploaded",
      tool: "png-to-webp",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`PNG to WEBP - ${req.files.length} file(s) received`)

    const jobId = Date.now().toString()
    const outputDir = "./uploads"
    const convertedFiles = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      totalOriginalSize += file.size

      const fileExtension = path.extname(file.originalname).toLowerCase()
      const outputFilename = `${jobId}-compressed-${i + 1}${fileExtension}`
      const outputPath = path.join(outputDir, outputFilename)

      try {
        if (file.mimetype === "image/png") {
          await sharp(file.path)
            .png({
              quality: 80,
              compressionLevel: 9,
              palette: true,
            })
            .toFile(outputPath)
        } else if (file.mimetype === "image/webp") {
          await sharp(file.path).webp({ quality: 85, effort: 6 }).toFile(outputPath)
        } else {
          await sharp(file.path).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(outputPath)
        }

        const stats = fs.statSync(outputPath)
        totalCompressedSize += stats.size

        convertedFiles.push({
          filename: outputFilename,
          originalName: file.originalname,
          originalSize: file.size,
          compressedSize: stats.size,
          savedPercentage: Math.round(((file.size - stats.size) / file.size) * 100),
        })

        console.log(`Converted: ${file.originalname} -> ${outputFilename}`)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (compError) {
        console.error(`Error compressing ${file.originalname}:`, compError)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    if (convertedFiles.length === 0) {
      logActivity({
        type: "conversion",
        action: "png_to_webp_failed",
        tool: "png-to-webp",
        error: "No files compressed",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ error: "No files were compressed successfully" })
    }

    const savedPercentage = Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)

    logActivity({
      type: "conversion",
      action: "png_to_webp_complete",
      tool: "png-to-webp",
      conversionType: "png-to-webp",
      fileCount: convertedFiles.length,
      savedPercentage: savedPercentage,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${convertedFiles.length} image(s) compressed successfully`,
      jobId: jobId,
      fileCount: convertedFiles.length,
      totalSize: totalOriginalSize,
      compressedSize: totalCompressedSize,
      savedPercentage: savedPercentage,
      files: convertedFiles,
    })
  } catch (error) {
    console.error("Compress Image Error:", error)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "png_to_webp_failed",
      tool: "png-to-webp",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({
      error: "Failed to compress images",
      details: error.message,
    })
  }
})

// Download endpoint for PNG to WEBP converted files
app.get("/api/download-webp-converted/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const uploadDir = "./uploads"

    const files = fs.readdirSync(uploadDir)
    const compressedFiles = files
      .filter((f) => f.startsWith(`${jobId}-compressed-`))
      .sort((a, b) => {
        const numA = Number.parseInt(a.match(/-compressed-(\d+)/)?.[1] || "0")
        const numB = Number.parseInt(b.match(/-compressed-(\d+)/)?.[1] || "0")
        return numA - numB
      })

    if (compressedFiles.length === 0) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "No files found",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "No files found for this job" })
    }

    if (compressedFiles.length === 1) {
      const filePath = path.join(uploadDir, compressedFiles[0])
      
      logActivity({
        type: "download",
        action: "file_downloaded",
        jobId: jobId,
        filename: compressedFiles[0],
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })
      
      return res.download(filePath, `compressed-image${path.extname(compressedFiles[0])}`, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    const zipFilename = `compressed-images-${jobId}.zip`
    const zipPath = path.join(uploadDir, zipFilename)

    const output = fs.createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.on("error", (err) => {
      throw err
    })

    archive.pipe(output)

    for (let i = 0; i < compressedFiles.length; i++) {
      const compressedFilePath = path.join(uploadDir, compressedFiles[i])
      if (fs.existsSync(compressedFilePath)) {
        const ext = path.extname(compressedFiles[i])
        archive.file(compressedFilePath, { name: `compressed-image-${i + 1}${ext}` })
      }
    }

    await archive.finalize()

    await new Promise((resolve, reject) => {
      output.on("close", resolve)
      output.on("error", reject)
    })

    logActivity({
      type: "download",
      action: "zip_downloaded",
      jobId: jobId,
      fileCount: compressedFiles.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.download(zipPath, zipFilename, (err) => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath)
      }
      for (const compressedFile of compressedFiles) {
        const compressedFilePath = path.join(uploadDir, compressedFile)
        if (fs.existsSync(compressedFilePath)) {
          fs.unlinkSync(compressedFilePath)
        }
      }
    })
  } catch (error) {
    console.error("Download compressed error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Compress Image endpoint
app.post("/api/compress-image", upload.array("files", 50), fileValidation, async (req, res) => {
  try {
    console.log("Compress Image - " + req.files.length + " file(s) received")

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "images_uploaded",
      tool: "compress-image",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    const jobId = Date.now().toString()
    const compressedDir = path.join(__dirname, "compressed", jobId)

    if (!fs.existsSync(compressedDir)) {
      fs.mkdirSync(compressedDir, { recursive: true })
    }

    const compressionLevel = req.body.quality || "balanced"

    const qualitySettings = {
      maximum: { quality: 60, compressionLevel: 9, effort: 6 },
      balanced: { quality: 75, compressionLevel: 6, effort: 4 },
      light: { quality: 85, compressionLevel: 3, effort: 3 },
    }

    const compressionSettings = qualitySettings[compressionLevel] || qualitySettings.balanced
    const quality = compressionSettings.quality

    const compressedFiles = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    for (const file of req.files) {
      totalOriginalSize += file.size

      const ext = path.extname(file.originalname)
      const outputFilename = `${Date.now()}-compressed-${file.originalname}`
      const outputPath = path.join(compressedDir, outputFilename)

      try {
        if (file.mimetype === "image/png") {
          await sharp(file.path)
            .png({
              quality: quality,
              compressionLevel: compressionSettings.compressionLevel || 6,
              palette: true,
            })
            .toFile(outputPath)
        } else if (file.mimetype === "image/webp") {
          await sharp(file.path)
            .webp({
              quality: quality,
              effort: compressionSettings.effort || 4,
            })
            .toFile(outputPath)
        } else if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
          await sharp(file.path)
            .jpeg({
              quality: quality,
              progressive: true,
              mozjpeg: true,
            })
            .toFile(outputPath)
        } else {
          await sharp(file.path)
            .jpeg({
              quality: quality,
              progressive: true,
            })
            .toFile(outputPath)
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        const stats = fs.statSync(outputPath)
        totalCompressedSize += stats.size

        compressedFiles.push({
          filename: outputFilename,
          originalName: file.originalname,
          originalSize: file.size,
          compressedSize: stats.size,
          savedPercentage: Math.round(((file.size - stats.size) / file.size) * 100),
        })

        console.log(`Compressed: ${file.originalname} -> ${outputFilename}`)

        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        } catch (unlinkErr) {
          console.log(`Warning: Could not delete ${file.path}, will retry later`)
          setTimeout(() => {
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
              }
            } catch (e) {
              console.log(`Still locked: ${file.path}`)
            }
          }, 5000)
        }
      } catch (compError) {
        console.error(`Error compressing ${file.originalname}:`, compError)

        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        } catch (cleanupErr) {
          console.log(`Warning: Could not delete ${file.path} after error`)
        }
      }
    }

    if (compressedFiles.length === 0) {
      logActivity({
        type: "conversion",
        action: "compress_image_failed",
        tool: "compress-image",
        error: "No files compressed",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ error: "No files were compressed successfully" })
    }

    const savedPercentage = Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)

    logActivity({
      type: "conversion",
      action: "compress_image_complete",
      tool: "compress-image",
      conversionType: "compress-image",
      fileCount: compressedFiles.length,
      savedPercentage: savedPercentage,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${compressedFiles.length} image(s) compressed successfully`,
      jobId: jobId,
      fileCount: compressedFiles.length,
      totalOriginalSize: totalOriginalSize,
      totalCompressedSize: totalCompressedSize,
      compressedSize: totalCompressedSize,
      savedPercentage: savedPercentage,
      files: compressedFiles,
    })
  } catch (error) {
    console.error("Compress Image Error:", error)

    if (req.files) {
      for (const file of req.files) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        } catch (cleanupErr) {
          console.log(`Warning: Could not delete ${file.path}`)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "compress_image_failed",
      tool: "compress-image",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({
      error: "Failed to compress images",
      details: error.message,
    })
  }
})

app.get("/api/download-compressed/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const compressedDir = path.join(__dirname, "compressed", jobId)

    if (!fs.existsSync(compressedDir)) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "Files not found or expired",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "Files not found or expired" })
    }

    const files = fs.readdirSync(compressedDir)

    if (files.length === 0) {
      return res.status(404).json({ error: "No compressed files available" })
    }

    if (files.length === 1) {
      const filePath = path.join(compressedDir, files[0])
      const originalName = files[0].replace(/^\d+-compressed-/, "")

      logActivity({
        type: "download",
        action: "file_downloaded",
        jobId: jobId,
        filename: originalName,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      res.download(filePath, originalName, (err) => {
        if (err) {
          console.error("Download error:", err)
          if (!res.headersSent) {
            res.status(500).json({ error: "Download failed" })
          }
        }

        setTimeout(() => {
          try {
            if (fs.existsSync(compressedDir)) {
              fs.rmSync(compressedDir, { recursive: true, force: true })
            }
          } catch (cleanupErr) {
            console.log("Cleanup error:", cleanupErr)
          }
        }, 5000)
      })
      return
    }

    const zipFilename = `compressed-images-${jobId}.zip`
    const zipPath = path.join(__dirname, "downloads", zipFilename)

    if (!fs.existsSync(path.join(__dirname, "downloads"))) {
      fs.mkdirSync(path.join(__dirname, "downloads"), { recursive: true })
    }

    const output = fs.createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    await new Promise((resolve, reject) => {
      output.on("close", resolve)
      output.on("error", reject)
      archive.on("error", reject)

      archive.pipe(output)

      files.forEach((file) => {
        const filePath = path.join(compressedDir, file)
        const originalName = file.replace(/^\d+-compressed-/, "")
        archive.file(filePath, { name: originalName })
      })

      archive.finalize()
    })

    logActivity({
      type: "download",
      action: "zip_downloaded",
      jobId: jobId,
      fileCount: files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.download(zipPath, zipFilename, (err) => {
      if (err) {
        console.error("Download error:", err)
      }

      setTimeout(() => {
        try {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath)
          }
          if (fs.existsSync(compressedDir)) {
            fs.rmSync(compressedDir, { recursive: true, force: true })
          }
        } catch (cleanupErr) {
          console.log("Cleanup error:", cleanupErr)
        }
      }, 5000)
    })
  } catch (error) {
    console.error("Download Compressed Error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to download files", details: error.message })
    }
  }
})

app.get("/api/download-word-pdf/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const convertedDir = path.join(__dirname, "converted", jobId)

    if (!fs.existsSync(convertedDir)) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "Files not found or expired",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "Files not found or expired" })
    }

    const files = fs.readdirSync(convertedDir)

    if (files.length === 0) {
      return res.status(404).json({ error: "No converted files available" })
    }

    if (files.length === 1) {
      const filePath = path.join(convertedDir, files[0])

      logActivity({
        type: "download",
        action: "file_downloaded",
        jobId: jobId,
        filename: files[0],
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      res.download(filePath, files[0], (err) => {
        if (err) {
          console.error("Download error:", err)
          if (!res.headersSent) {
            res.status(500).json({ error: "Download failed" })
          }
        }

        setTimeout(() => {
          try {
            if (fs.existsSync(convertedDir)) {
              fs.rmSync(convertedDir, { recursive: true, force: true })
            }
          } catch (cleanupErr) {
            console.log("Cleanup error:", cleanupErr)
          }
        }, 5000)
      })
      return
    }

    const zipFilename = `converted-pdfs-${jobId}.zip`
    const zipPath = path.join(__dirname, "downloads", zipFilename)

    if (!fs.existsSync(path.join(__dirname, "downloads"))) {
      fs.mkdirSync(path.join(__dirname, "downloads"), { recursive: true })
    }

    const output = fs.createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    await new Promise((resolve, reject) => {
      output.on("close", resolve)
      output.on("error", reject)
      archive.on("error", reject)

      archive.pipe(output)

      files.forEach((file) => {
        const filePath = path.join(convertedDir, file)
        archive.file(filePath, { name: file })
      })

      archive.finalize()
    })

    logActivity({
      type: "download",
      action: "zip_downloaded",
      jobId: jobId,
      fileCount: files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.download(zipPath, zipFilename, (err) => {
      if (err) {
        console.error("Download error:", err)
      }

      setTimeout(() => {
        try {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath)
          }
          if (fs.existsSync(convertedDir)) {
            fs.rmSync(convertedDir, { recursive: true, force: true })
          }
        } catch (cleanupErr) {
          console.log("Cleanup error:", cleanupErr)
        }
      }, 5000)
    })
  } catch (error) {
    console.error("Download Word PDF Error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to download files", details: error.message })
    }
  }
})

app.post("/api/merge-pdf", upload.array("files", 20), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "At least 2 PDF files required for merging" })
    }

    logActivity({
      type: "upload",
      action: "pdfs_uploaded",
      tool: "merge-pdf",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`Merge PDF - ${req.files.length} files received`)

    const mergedPdf = await PDFLibDocument.create()

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      console.log(`Processing file ${i + 1}/${req.files.length}: ${file.originalname}`)

      try {
        const pdfBytes = fs.readFileSync(file.path)
        const pdf = await PDFLibDocument.load(pdfBytes, { ignoreEncryption: true })
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => {
          mergedPdf.addPage(page)
        })

        console.log(`Added ${pages.length} pages from ${file.originalname}`)
      } catch (pdfError) {
        console.error(`Error processing ${file.originalname}:`, pdfError)
      }
    }

    const mergedPdfBytes = await mergedPdf.save()
    const outputFilename = `merged-${Date.now()}.pdf`
    const outputPath = path.join("./uploads", outputFilename)

    fs.writeFileSync(outputPath, mergedPdfBytes)

    console.log(`Merged PDF created: ${outputFilename}`)

    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
    }

    const totalPages = mergedPdf.getPageCount()

    logActivity({
      type: "conversion",
      action: "merge_pdf_complete",
      tool: "merge-pdf",
      conversionType: "merge-pdf",
      fileCount: req.files.length,
      pageCount: totalPages,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${req.files.length} PDF files merged successfully`,
      downloadUrl: `/uploads/${outputFilename}`,
      convertedName: outputFilename,
      pageCount: totalPages,
      fileCount: req.files.length,
    })
  } catch (error) {
    console.error("Merge PDF Error:", error)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "merge_pdf_failed",
      tool: "merge-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({ error: error.message })
  }
})

// Batch PDF Compression endpoint
app.post("/api/compress-pdf-batch", upload.array("files", 10), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDF files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdfs_uploaded",
      tool: "compress-pdf",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`Compress PDF Batch - ${req.files.length} file(s) received`)

    const jobId = Date.now().toString()
    const compressedDir = path.join(__dirname, "compressed", jobId)

    if (!fs.existsSync(compressedDir)) {
      fs.mkdirSync(compressedDir, { recursive: true })
    }

    const compressionLevel = req.body.level || "balanced"
    console.log("Compression level:", compressionLevel)

    const compressionSettings = {
      maximum: {
        setting: "/screen",
        imageResolution: 300,
        description: "Maximum Quality"
      },
      balanced: {
        setting: "/ebook",
        imageResolution: 150,
        description: "Balanced"
      },
      extreme: {
        setting: "/screen",
        imageResolution: 72,
        description: "Extreme Compression"
      }
    }

    const settings = compressionSettings[compressionLevel] || compressionSettings.balanced
    const gsPath = getGhostscriptPath()

    const compressedFiles = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    for (const file of req.files) {
      totalOriginalSize += file.size

      const outputFilename = `${Date.now()}-compressed-${file.originalname}`
      const outputPath = path.join(compressedDir, outputFilename)

      try {
        const command = `"${gsPath}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${settings.setting} -dNOPAUSE -dQUIET -dBATCH -dDownsampleColorImages=true -dColorImageResolution=${settings.imageResolution} -dDownsampleGrayImages=true -dGrayImageResolution=${settings.imageResolution} -dDownsampleMonoImages=true -dMonoImageResolution=${settings.imageResolution} -sOutputFile="${outputPath}" "${file.path}"`

        console.log(`Compressing ${file.originalname} with ${settings.description}...`)

        await execPromise(command, {
          timeout: 120000,
          maxBuffer: 50 * 1024 * 1024,
        })

        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath)
          totalCompressedSize += stats.size

          compressedFiles.push({
            filename: outputFilename,
            originalName: file.originalname,
            originalSize: file.size,
            compressedSize: stats.size,
            savedPercentage: Math.round(((file.size - stats.size) / file.size) * 100),
          })

          console.log(`Compressed: ${file.originalname} (${formatFileSize(file.size)} → ${formatFileSize(stats.size)})`)
        } else {
          throw new Error("Compressed PDF not created")
        }

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (compError) {
        console.error(`Error compressing ${file.originalname}:`, compError)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    if (compressedFiles.length === 0) {
      logActivity({
        type: "conversion",
        action: "compress_pdf_failed",
        tool: "compress-pdf",
        error: "No files compressed",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ 
        error: "No files were compressed successfully. Please ensure Ghostscript is installed." 
      })
    }

    const savedPercentage = totalOriginalSize > 0 
      ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
      : 0

    logActivity({
      type: "conversion",
      action: "compress_pdf_complete",
      tool: "compress-pdf",
      conversionType: "compress-pdf",
      fileCount: compressedFiles.length,
      savedPercentage: savedPercentage,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${compressedFiles.length} PDF(s) compressed successfully`,
      jobId: jobId,
      fileCount: compressedFiles.length,
      totalOriginalSize: totalOriginalSize,
      compressedSize: totalCompressedSize,
      savedPercentage: savedPercentage,
      compressionLevel: compressionLevel,
      files: compressedFiles,
    })
  } catch (error) {
    console.error("Compress PDF Batch Error:", error)

    if (req.files) {
      for (const file of req.files) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        } catch (cleanupErr) {
          console.log(`Warning: Could not delete ${file.path}`)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "compress_pdf_failed",
      tool: "compress-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({
      error: "Failed to compress PDFs",
      details: error.message,
    })
  }
})

// PDF to JPG
app.post("/api/pdf-to-jpg", upload.single("file"), fileValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdf_uploaded",
      tool: "pdf-to-jpg",
      filename: req.file.originalname,
      fileSize: req.file.size,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log("PDF to JPG - File received:", req.file.originalname)

    const inputPath = req.file.path
    const outputDir = path.dirname(inputPath)
    const baseName = path.basename(req.file.filename, path.extname(req.file.filename))

    const quality = req.body.quality || "standard"
    let dpi = 150
    if (quality === "high") dpi = 300
    if (quality === "maximum") dpi = 600

    console.log(`Converting PDF to JPG with DPI: ${dpi}...`)

    const gsPath = getGhostscriptPath()
    const outputPattern = path.join(outputDir, `${baseName}-page-%d.jpg`)

    const command = `"${gsPath}" -dNOPAUSE -dBATCH -dSAFER -sDEVICE=jpeg -dJPEGQ=95 -r${dpi} -sOutputFile="${outputPattern}" "${inputPath}"`

    try {
      await execPromise(command, {
        timeout: 120000,
        maxBuffer: 50 * 1024 * 1024,
      })

      const files = fs.readdirSync(outputDir)
      const jpgFiles = files
        .filter((f) => f.startsWith(baseName + "-page-") && f.endsWith(".jpg"))
        .sort((a, b) => {
          const numA = Number.parseInt(a.match(/-page-(\d+)/)?.[1] || "0")
          const numB = Number.parseInt(b.match(/-page-(\d+)/)?.[1] || "0")
          return numA - numB
        })

      if (jpgFiles.length === 0) {
        throw new Error("No JPG files were created.")
      }

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "pdf_to_jpg_complete",
        tool: "pdf-to-jpg",
        conversionType: "pdf-to-jpg",
        filename: req.file.originalname,
        pageCount: jpgFiles.length,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      if (jpgFiles.length === 1) {
        res.json({
          success: true,
          message: "PDF converted to JPG successfully",
          pageCount: 1,
          downloadUrl: `/uploads/${jpgFiles[0]}`,
          originalName: req.file.originalname,
          convertedName: jpgFiles[0],
          files: jpgFiles.map((f) => `/uploads/${f}`),
        })
      } else {
        const zipFilename = `${baseName}-images.zip`
        const zipPath = path.join(outputDir, zipFilename)

        const output = fs.createWriteStream(zipPath)
        const archive = archiver("zip", { zlib: { level: 9 } })

        archive.on("error", (err) => {
          throw err
        })

        archive.pipe(output)

        for (const jpgFile of jpgFiles) {
          const jpgFilePath = path.join(outputDir, jpgFile)
          if (fs.existsSync(jpgFilePath)) {
            archive.file(jpgFilePath, { name: jpgFile })
          }
        }

        await archive.finalize()

        await new Promise((resolve, reject) => {
          output.on("close", resolve)
          output.on("error", reject)
        })

        for (const jpgFile of jpgFiles) {
          const jpgFilePath = path.join(outputDir, jpgFile)
          if (fs.existsSync(jpgFilePath)) {
            fs.unlinkSync(jpgFilePath)
          }
        }

        res.json({
          success: true,
          message: `PDF converted to ${jpgFiles.length} JPG images successfully`,
          pageCount: jpgFiles.length,
          downloadUrl: `/uploads/${zipFilename}`,
          originalName: req.file.originalname,
          convertedName: zipFilename,
          isZip: true,
        })
      }
    } catch (conversionError) {
      console.error("PDF to JPG conversion error:", conversionError)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "pdf_to_jpg_failed",
        tool: "pdf-to-jpg",
        filename: req.file.originalname,
        error: conversionError.message,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })

      res.status(500).json({
        error: "PDF to JPG conversion failed.",
        details: conversionError.message,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    
    logActivity({
      type: "conversion",
      action: "pdf_to_jpg_failed",
      tool: "pdf-to-jpg",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// PDF to PNG Conversion
app.post("/api/pdf-to-png", upload.single("pdf"), fileValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdf_uploaded",
      tool: "pdf-to-png",
      filename: req.file.originalname,
      fileSize: req.file.size,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log("PDF to PNG - File received:", req.file.originalname)

    const inputPath = req.file.path
    const outputDir = path.dirname(inputPath)
    const baseName = path.basename(req.file.filename, path.extname(req.file.filename))
    const jobId = Date.now().toString()

    const dpi = 150

    console.log(`Converting PDF to PNG with DPI: ${dpi}...`)

    const gsPath = getGhostscriptPath()
    const outputPattern = path.join(outputDir, `${jobId}-page-%d.png`)

    const command = `"${gsPath}" -dNOPAUSE -dBATCH -dSAFER -sDEVICE=png16m -r${dpi} -sOutputFile="${outputPattern}" "${inputPath}"`

    try {
      await execPromise(command, {
        timeout: 120000,
        maxBuffer: 50 * 1024 * 1024,
      })

      const files = fs.readdirSync(outputDir)
      const pngFiles = files
        .filter((f) => f.startsWith(jobId + "-page-") && f.endsWith(".png"))
        .sort((a, b) => {
          const numA = Number.parseInt(a.match(/-page-(\d+)/)?.[1] || "0")
          const numB = Number.parseInt(b.match(/-page-(\d+)/)?.[1] || "0")
          return numA - numB
        })

      if (pngFiles.length === 0) {
        throw new Error("No PNG files were created.")
      }

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      console.log(`PDF to PNG - ${pngFiles.length} pages converted`)

      logActivity({
        type: "conversion",
        action: "pdf_to_png_complete",
        tool: "pdf-to-png",
        conversionType: "pdf-to-png",
        filename: req.file.originalname,
        pageCount: pngFiles.length,
        jobId: jobId,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      res.json({
        success: true,
        message: `PDF converted to ${pngFiles.length} PNG image(s) successfully`,
        jobId: jobId,
        pageCount: pngFiles.length,
        originalName: req.file.originalname,
        files: pngFiles.map((f) => `/uploads/${f}`),
      })
    } catch (conversionError) {
      console.error("PDF to PNG conversion error:", conversionError)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "pdf_to_png_failed",
        tool: "pdf-to-png",
        filename: req.file.originalname,
        error: conversionError.message,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })

      res.status(500).json({
        error: "PDF to PNG conversion failed. Please ensure Ghostscript is installed.",
        details: conversionError.message,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    
    logActivity({
      type: "conversion",
      action: "pdf_to_png_failed",
      tool: "pdf-to-png",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// WEBP to PNG Conversion
app.post("/api/webp-to-png", upload.array("files", 20), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "webp_uploaded",
      tool: "webp-to-png",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`WEBP to PNG - ${req.files.length} file(s) received`)

    const jobId = Date.now().toString()
    const outputDir = "./uploads"
    const convertedFiles = []

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const outputFilename = `${jobId}-page-${i + 1}.png`
      const outputPath = path.join(outputDir, outputFilename)

      try {
        await sharp(file.path).png({ quality: 100, compressionLevel: 6 }).toFile(outputPath)

        convertedFiles.push(outputFilename)
        console.log(`Converted: ${file.originalname} -> ${outputFilename}`)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (convError) {
        console.error(`Error converting ${file.originalname}:`, convError)
      }
    }

    if (convertedFiles.length === 0) {
      logActivity({
        type: "conversion",
        action: "webp_to_png_failed",
        tool: "webp-to-png",
        error: "No files converted",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ error: "No files were converted successfully" })
    }

    logActivity({
      type: "conversion",
      action: "webp_to_png_complete",
      tool: "webp-to-png",
      conversionType: "webp-to-png",
      fileCount: convertedFiles.length,
      jobId: jobId,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${convertedFiles.length} WEBP image(s) converted to PNG successfully`,
      jobId: jobId,
      pageCount: convertedFiles.length,
      files: convertedFiles.map((f) => `/uploads/${f}`),
    })
  } catch (error) {
    console.error("WEBP to PNG Error:", error)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "webp_to_png_failed",
      tool: "webp-to-png",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({ error: error.message })
  }
})

app.get("/api/download/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const uploadDir = "./uploads"

    console.log(`Download request for jobId: ${jobId}`)

    if (!fs.existsSync(uploadDir)) {
      console.error("Uploads directory not found")
      
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "Upload directory not found",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "Upload directory not found" })
    }

    const files = fs.readdirSync(uploadDir)
    
    const convertedFiles = files
      .filter((f) => f.startsWith(`${jobId}-page-`) && f.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/-page-(\d+)/)?.[1] || "0")
        const numB = parseInt(b.match(/-page-(\d+)/)?.[1] || "0")
        return numA - numB
      })

    console.log(`Found ${convertedFiles.length} converted files for job ${jobId}`)

    if (convertedFiles.length === 0) {
      console.error(`No files found with pattern: ${jobId}-page-*.png`)
      
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "No files found for this job",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ 
        error: "No files found for this job",
        jobId: jobId,
        pattern: `${jobId}-page-*.png`
      })
    }

    if (convertedFiles.length === 1) {
      const filePath = path.join(uploadDir, convertedFiles[0])
      console.log(`Downloading single file: ${filePath}`)
      
      logActivity({
        type: "download",
        action: "file_downloaded",
        jobId: jobId,
        filename: convertedFiles[0],
        fileCount: 1,
        ip: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        status: "success",
      })
      
      return res.download(filePath, "converted-image.png", (err) => {
        if (err) {
          console.error("Download error:", err)
        }
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`Cleaned up: ${filePath}`)
          }
        }, 1000)
      })
    }

    console.log(`Creating ZIP archive for ${convertedFiles.length} files`)
    
    const zipFilename = `converted-images-${jobId}.zip`
    const zipPath = path.join(uploadDir, zipFilename)

    const output = fs.createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.on("error", (err) => {
      console.error("Archiver error:", err)
      throw err
    })

    archive.pipe(output)

    for (let i = 0; i < convertedFiles.length; i++) {
      const filePath = path.join(uploadDir, convertedFiles[i])
      if (fs.existsSync(filePath)) {
        const filename = `converted-image-${i + 1}.png`
        archive.file(filePath, { name: filename })
        console.log(`Added to ZIP: ${filename}`)
      }
    }

    await archive.finalize()

    await new Promise((resolve, reject) => {
      output.on("close", () => {
        console.log(`ZIP created: ${archive.pointer()} bytes`)
        resolve()
      })
      output.on("error", reject)
    })

    logActivity({
      type: "download",
      action: "zip_downloaded",
      jobId: jobId,
      filename: zipFilename,
      fileCount: convertedFiles.length,
      size: archive.pointer(),
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.download(zipPath, zipFilename, (err) => {
      if (err) {
        console.error("ZIP download error:", err)
      }
      
      setTimeout(() => {
        try {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath)
            console.log(`Cleaned up ZIP: ${zipPath}`)
          }
          
          for (const file of convertedFiles) {
            const filePath = path.join(uploadDir, file)
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
              console.log(`Cleaned up: ${filePath}`)
            }
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError)
        }
      }, 1000)
    })
  } catch (error) {
    console.error("Download endpoint error:", error)
    console.error("Stack:", error.stack)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to download files",
        details: error.message 
      })
    }
  }
})

// REMAINING ENDPOINTS - Add these to the main server.js file

// ============================================
// SPLIT PDF ENDPOINTS
// ============================================

// Analyze PDF and generate thumbnails
app.post("/api/analyze-pdf", upload.single("file"), fileValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdf_uploaded",
      tool: "split-pdf",
      filename: req.file.originalname,
      fileSize: req.file.size,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log("Analyze PDF - File received:", req.file.originalname)

    const inputPath = req.file.path
    const jobId = Date.now().toString()
    const thumbnailDir = path.join(__dirname, "uploads", "thumbnails", jobId)
    
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    try {
      const pdfBytes = fs.readFileSync(inputPath)
      const pdfDoc = await PDFLibDocument.load(pdfBytes, { ignoreEncryption: true })
      const pageCount = pdfDoc.getPageCount()
      
      console.log(`PDF has ${pageCount} pages`)

      const gsPath = getGhostscriptPath()
      const thumbnails = []
      
      try {
        const outputPattern = path.join(thumbnailDir, `page-%d.png`)
        const command = `"${gsPath}" -dNOPAUSE -dBATCH -dSAFER -sDEVICE=png16m -r36 -dFirstPage=1 -dLastPage=${Math.min(pageCount, 50)} -sOutputFile="${outputPattern}" "${inputPath}"`
        
        await execPromise(command, {
          timeout: 60000,
          maxBuffer: 50 * 1024 * 1024,
        })
        
        for (let i = 1; i <= Math.min(pageCount, 50); i++) {
          const thumbPath = path.join(thumbnailDir, `page-${i}.png`)
          if (fs.existsSync(thumbPath)) {
            thumbnails.push({
              pageNumber: i,
              url: `/uploads/thumbnails/${jobId}/page-${i}.png`,
            })
          }
        }
        
        console.log(`Generated ${thumbnails.length} thumbnails`)
      } catch (gsError) {
        console.error("Ghostscript thumbnail generation failed:", gsError)
      }

      const storedPath = path.join(__dirname, "uploads", `${jobId}-original.pdf`)
      fs.copyFileSync(inputPath, storedPath)
      
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "pdf_analyzed",
        tool: "split-pdf",
        filename: req.file.originalname,
        pageCount: pageCount,
        jobId: jobId,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      res.json({
        success: true,
        jobId: jobId,
        pageCount: pageCount,
        thumbnails: thumbnails,
        originalFile: `${jobId}-original.pdf`,
      })
    } catch (pdfError) {
      console.error("PDF analysis error:", pdfError)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "pdf_analyze_failed",
        tool: "split-pdf",
        filename: req.file.originalname,
        error: pdfError.message,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })

      res.status(500).json({
        error: "Failed to analyze PDF",
        details: pdfError.message,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    
    logActivity({
      type: "conversion",
      action: "pdf_analyze_failed",
      tool: "split-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Split PDF - Extract specific pages
app.post("/api/split-pdf", upload.single("file"), fileValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdf_uploaded",
      tool: "split-pdf",
      filename: req.file.originalname,
      fileSize: req.file.size,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log("Split PDF - File received:", req.file.originalname)

    let selectedPages = []
    try {
      selectedPages = JSON.parse(req.body.pages || "[]")
    } catch (e) {
      return res.status(400).json({ error: "Invalid pages parameter" })
    }

    if (selectedPages.length === 0) {
      return res.status(400).json({ error: "No pages selected for extraction" })
    }

    console.log(`Extracting pages: ${selectedPages.join(", ")}`)

    const inputPath = req.file.path
    const jobId = Date.now().toString()
    const outputDir = path.join(__dirname, "uploads")
    const baseName = path.basename(req.file.originalname, ".pdf")
    const outputFilename = `${jobId}-split-${baseName}.pdf`
    const outputPath = path.join(outputDir, outputFilename)

    try {
      const pdfBytes = fs.readFileSync(inputPath)
      const pdfDoc = await PDFLibDocument.load(pdfBytes, { ignoreEncryption: true })
      
      const newPdfDoc = await PDFLibDocument.create()
      
      const totalPages = pdfDoc.getPageCount()
      
      const validPages = selectedPages.filter(p => p >= 1 && p <= totalPages)
      
      if (validPages.length === 0) {
        throw new Error("No valid pages to extract")
      }
      
      const pageIndices = validPages.map(p => p - 1)
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices)
      
      copiedPages.forEach(page => {
        newPdfDoc.addPage(page)
      })
      
      const newPdfBytes = await newPdfDoc.save()
      fs.writeFileSync(outputPath, newPdfBytes)
      
      console.log(`Split PDF created: ${outputFilename} with ${validPages.length} pages`)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      const stats = fs.statSync(outputPath)

      logActivity({
        type: "conversion",
        action: "split_pdf_complete",
        tool: "split-pdf",
        conversionType: "split-pdf",
        filename: req.file.originalname,
        pageCount: validPages.length,
        jobId: jobId,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "success",
      })

      res.json({
        success: true,
        message: `Successfully extracted ${validPages.length} page(s) from PDF`,
        jobId: jobId,
        downloadUrl: `/uploads/${outputFilename}`,
        convertedName: outputFilename,
        pageCount: validPages.length,
        extractedPages: validPages,
        originalPages: totalPages,
        fileSize: stats.size,
      })
    } catch (splitError) {
      console.error("PDF split error:", splitError)

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }

      logActivity({
        type: "conversion",
        action: "split_pdf_failed",
        tool: "split-pdf",
        filename: req.file.originalname,
        error: splitError.message,
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })

      res.status(500).json({
        error: "Failed to split PDF",
        details: splitError.message,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    
    logActivity({
      type: "conversion",
      action: "split_pdf_failed",
      tool: "split-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Download endpoint for split PDF
app.get("/api/download-split/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const uploadDir = "./uploads"

    const files = fs.readdirSync(uploadDir)
    const splitFile = files.find(f => f.startsWith(`${jobId}-split-`) && f.endsWith(".pdf"))

    if (!splitFile) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "Split PDF not found or expired",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "Split PDF not found or expired" })
    }

    const filePath = path.join(uploadDir, splitFile)
    const downloadName = splitFile.replace(`${jobId}-split-`, "split-")

    logActivity({
      type: "download",
      action: "file_downloaded",
      jobId: jobId,
      filename: splitFile,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error("Download error:", err)
        if (!res.headersSent) {
          res.status(500).json({ error: "Download failed" })
        }
      }
      
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        } catch (cleanupErr) {
          console.log("Cleanup error:", cleanupErr)
        }
      }, 5000)
    })
  } catch (error) {
    console.error("Download split error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// PDF TO WORD ENDPOINT
// ============================================

app.post("/api/pdf-to-word", upload.array("files", 10), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDF files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "pdfs_uploaded",
      tool: "pdf-to-word",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`PDF to Word - ${req.files.length} file(s) received`)

    const jobId = Date.now().toString()
    const outputDir = "./uploads"
    const convertedFiles = []

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]

      if (file.mimetype !== "application/pdf") {
        console.log(`Skipping non-PDF file: ${file.originalname}`)
        continue
      }

      const baseName = path.basename(file.originalname, ".pdf")
      const outputFilename = `${jobId}-converted-${baseName}.docx`
      const outputPath = path.join(outputDir, outputFilename)

      try {
        const dataBuffer = fs.readFileSync(file.path)
        
        console.log(`Extracting text from: ${file.originalname}`)
        let pdfData
        try {
          pdfData = await pdfParse(dataBuffer)
        } catch (parseError) {
          console.error(`PDF parse error for ${file.originalname}:`, parseError)
          pdfData = { text: '', numpages: 0 }
        }
        
        const pdfDoc = await PDFLibDocument.load(dataBuffer)
        const pages = pdfDoc.getPages()

        console.log(`Extracted ${pdfData.text.length} characters from ${pages.length} pages`)

        const textContent = pdfData.text.trim()
        
        const paragraphs = []

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: baseName,
                bold: true,
                size: 32,
                color: "2E4057",
              }),
            ],
            spacing: { after: 300 },
          })
        )

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Converted from: ${file.originalname}`,
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 200 },
          })
        )

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Pages: ${pages.length} | Characters: ${textContent.length}`,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 400 },
            border: {
              bottom: {
                color: "CCCCCC",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          })
        )

        if (textContent.length > 0) {
          const textParagraphs = textContent.split(/\n\n+|\r\n\r\n+/)
          
          textParagraphs.forEach((paraText) => {
            const trimmed = paraText.trim()
            if (trimmed.length > 0) {
              const lines = trimmed.split(/\n|\r\n/)
              
              lines.forEach((line) => {
                const trimmedLine = line.trim()
                if (trimmedLine.length > 0) {
                  paragraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: trimmedLine,
                          size: 22,
                        }),
                      ],
                      spacing: { after: 120 },
                    })
                  )
                }
              })
            }
          })
        } else {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "⚠ This PDF appears to be image-based or contains no extractable text.",
                  color: "CC0000",
                  italics: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 200 },
            })
          )

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "The PDF structure has been analyzed:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 200, after: 200 },
            })
          )

          pages.forEach((page, idx) => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Page ${idx + 1}: ${page.getWidth().toFixed(0)} x ${page.getHeight().toFixed(0)} pts`,
                    size: 22,
                  }),
                ],
                spacing: { after: 100 },
              })
            )
          })
        }

        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                  },
                },
              },
              children: paragraphs,
            },
          ],
        })

        const buffer = await Packer.toBuffer(doc)
        fs.writeFileSync(outputPath, buffer)

        const stats = fs.statSync(outputPath)

        convertedFiles.push({
          filename: outputFilename,
          originalName: file.originalname,
          fileSize: stats.size,
          pageCount: pages.length,
          charactersExtracted: textContent.length,
        })

        console.log(`Converted: ${file.originalname} -> ${outputFilename} (${textContent.length} chars)`)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (convError) {
        console.error(`Error converting ${file.originalname}:`, convError)

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    if (convertedFiles.length === 0) {
      logActivity({
        type: "conversion",
        action: "pdf_to_word_failed",
        tool: "pdf-to-word",
        error: "No files converted",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ error: "No files were converted successfully" })
    }

    logActivity({
      type: "conversion",
      action: "pdf_to_word_complete",
      tool: "pdf-to-word",
      conversionType: "pdf-to-word",
      fileCount: convertedFiles.length,
      jobId: jobId,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${convertedFiles.length} PDF(s) converted to Word successfully`,
      jobId: jobId,
      fileCount: convertedFiles.length,
      files: convertedFiles,
    })
  } catch (error) {
    console.error("PDF to Word Error:", error)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "pdf_to_word_failed",
      tool: "pdf-to-word",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({
      error: "Failed to convert PDF to Word",
      details: error.message,
    })
  }
})

// Download endpoint for PDF to Word converted files
app.get("/api/download-word/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const uploadDir = "./uploads"

    const files = fs.readdirSync(uploadDir)
    const docxFiles = files
      .filter((f) => f.startsWith(`${jobId}-converted-`) && f.endsWith(".docx"))
      .sort()

    if (docxFiles.length === 0) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "No files found for this job",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "No files found for this job" })
    }

    if (docxFiles.length === 1) {
      const filePath = path.join(uploadDir, docxFiles[0])
      const originalName = docxFiles[0].replace(`${jobId}-converted-`, "")
      
      logActivity({
        type: "download",
        action: "file_downloaded",
        jobId: jobId,
        filename: originalName,
        ip: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        status: "success",
      })
      
      return res.download(filePath, originalName, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    const zipFilename = `converted-word-documents-${jobId}.zip`
    const zipPath = path.join(uploadDir, zipFilename)

    const output = fs.createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.on("error", (err) => {
      throw err
    })

    archive.pipe(output)

    for (const docxFile of docxFiles) {
      const docxFilePath = path.join(uploadDir, docxFile)
      if (fs.existsSync(docxFilePath)) {
        const originalName = docxFile.replace(`${jobId}-converted-`, "")
        archive.file(docxFilePath, { name: originalName })
      }
    }

    await archive.finalize()

    await new Promise((resolve, reject) => {
      output.on("close", resolve)
      output.on("error", reject)
    })

    logActivity({
      type: "download",
      action: "zip_downloaded",
      jobId: jobId,
      fileCount: docxFiles.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.download(zipPath, zipFilename, (err) => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath)
      }
      for (const docxFile of docxFiles) {
        const docxFilePath = path.join(uploadDir, docxFile)
        if (fs.existsSync(docxFilePath)) {
          fs.unlinkSync(docxFilePath)
        }
      }
    })
  } catch (error) {
    console.error("Download Word error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// JPG TO PDF ENDPOINT
// ============================================

app.post("/api/jpg-to-pdf", upload.array("files", 20), fileValidation, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    logActivity({
      type: "upload",
      action: "jpg_uploaded",
      tool: "jpg-to-pdf",
      fileCount: req.files.length,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "processing",
    })

    console.log(`JPG to PDF - ${req.files.length} file(s) received`)

    const jobId = Date.now().toString()
    const pageSize = req.body.pageSize || "a4"
    const orientation = req.body.orientation || "auto"

    const outputFilename = `converted-images-${jobId}.pdf`
    const outputPath = path.join("./uploads", outputFilename)

    const pageSizes = {
      a4: { width: 595.28, height: 841.89 },
      letter: { width: 612, height: 792 },
      legal: { width: 612, height: 1008 },
    }

    const doc = new PDFDocument({
      autoFirstPage: false,
      margin: 0,
    })

    const writeStream = fs.createWriteStream(outputPath)
    doc.pipe(writeStream)

    let successCount = 0

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]

      const ext = path.extname(file.originalname).toLowerCase()
      if (!file.mimetype.match(/^image\/(jpeg|jpg)$/i) && ext !== '.jpg' && ext !== '.jpeg') {
        console.log(`Skipping non-JPG file: ${file.originalname}`)
        continue
      }

      try {
        let dimensions
        try {
          dimensions = sizeOf(file.path)
        } catch (sizeError) {
          console.error(`Error getting image dimensions for ${file.originalname}:`, sizeError)
          const metadata = await sharp(file.path).metadata()
          dimensions = { width: metadata.width, height: metadata.height }
        }

        const imgWidth = dimensions.width
        const imgHeight = dimensions.height

        if (!imgWidth || !imgHeight) {
          console.error(`Invalid dimensions for ${file.originalname}`)
          continue
        }

        let pageWidth, pageHeight

        if (pageSize === "fit") {
          pageWidth = imgWidth * 0.75
          pageHeight = imgHeight * 0.75
        } else {
          const size = pageSizes[pageSize] || pageSizes.a4

          if (orientation === "auto") {
            const isLandscape = imgWidth > imgHeight
            pageWidth = isLandscape ? size.height : size.width
            pageHeight = isLandscape ? size.width : size.height
          } else if (orientation === "landscape") {
            pageWidth = size.height
            pageHeight = size.width
          } else {
            pageWidth = size.width
            pageHeight = size.height
          }
        }

        doc.addPage({ size: [pageWidth, pageHeight], margin: 0 })

        const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale

        const x = (pageWidth - scaledWidth) / 2
        const y = (pageHeight - scaledHeight) / 2

        doc.image(file.path, x, y, { width: scaledWidth, height: scaledHeight })

        successCount++
        console.log(`Added JPG ${successCount}/${req.files.length}: ${file.originalname}`)
      } catch (imgError) {
        console.error(`Error processing JPG ${file.originalname}:`, imgError)
        console.error(`Error details:`, imgError.stack)
      }
    }

    if (successCount === 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
      
      logActivity({
        type: "conversion",
        action: "jpg_to_pdf_failed",
        tool: "jpg-to-pdf",
        error: "No valid JPG images processed",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(500).json({ error: "No valid JPG images were processed" })
    }

    doc.end()

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve)
      writeStream.on("error", reject)
    })

    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
    }

    console.log(`JPG to PDF - Created PDF with ${successCount} pages`)

    logActivity({
      type: "conversion",
      action: "jpg_to_pdf_complete",
      tool: "jpg-to-pdf",
      conversionType: "jpg-to-pdf",
      pageCount: successCount,
      jobId: jobId,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "success",
    })

    res.json({
      success: true,
      message: `${successCount} JPG image(s) converted to PDF successfully`,
      jobId: jobId,
      downloadUrl: `/uploads/${outputFilename}`,
      convertedName: outputFilename,
      pageCount: successCount,
      fileCount: successCount,
    })
  } catch (error) {
    console.error("JPG to PDF Error:", error)
    console.error("Error stack:", error.stack)

    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    logActivity({
      type: "conversion",
      action: "jpg_to_pdf_failed",
      tool: "jpg-to-pdf",
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })

    res.status(500).json({
      error: "Failed to convert JPG to PDF",
      details: error.message,
    })
  }
})

// Download endpoint for JPG to PDF converted files
app.get("/api/download-jpg-pdf/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const uploadDir = "./uploads"

    const pdfFilename = `converted-images-${jobId}.pdf`
    const pdfPath = path.join(uploadDir, pdfFilename)

    if (!fs.existsSync(pdfPath)) {
      logActivity({
        type: "download",
        action: "download_failed",
        jobId: jobId,
        error: "PDF file not found",
        ip: req.ip || req.headers["x-forwarded-for"],
        status: "error",
      })
      
      return res.status(404).json({ error: "PDF file not found" })
    }

    logActivity({
      type: "download",
      action: "file_downloaded",
      jobId: jobId,
      filename: pdfFilename,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "success",
    })

    res.download(pdfPath, "converted-images.pdf", (err) => {
      if (err) {
        console.error("Download error:", err)
      }
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath)
      }
    })
  } catch (error) {
    console.error("Download JPG PDF error:", error)
    
    logActivity({
      type: "download",
      action: "download_failed",
      jobId: req.params.jobId,
      error: error.message,
      ip: req.ip || req.headers["x-forwarded-for"],
      status: "error",
    })
    
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`)
  console.log(`✓ Admin panel: Login at /api/admin/login`)
  console.log(`✓ Blog system: http://localhost:${PORT}/api/blog/posts`)
  console.log(`✓ Default admin credentials: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`)
  console.log(`⚠️  CHANGE DEFAULT PASSWORD IN PRODUCTION!`)
})