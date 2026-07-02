const ContentItem = require('../models/ContentItem');
const BlogPost = require('../models/BlogPost');

// ── Helpers ────────────────────────────────────────────────────────────────

const slug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Normalize plural URL params to singular enum values stored in DB
// e.g. 'faqs' → 'faq', 'banners' → 'banner', 'testimonials' → 'testimonial'
const normalizeType = (param) => {
  const MAP = { banners: 'banner', faqs: 'faq', testimonials: 'testimonial' };
  return MAP[param] || param;
};

// ── Content Items (banners / faqs / testimonials) ──────────────────────────

exports.listItems = async (req, res, next) => {
  try {
    const type = normalizeType(req.params.type);
    const admin = req.query.admin === 'true';
    const filter = { type };
    if (!admin) filter.isActive = true;
    const items = await ContentItem.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.createItem = async (req, res, next) => {
  try {
    const type = normalizeType(req.params.type);
    const item = await ContentItem.create({ ...req.body, type });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await ContentItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    await ContentItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.patchItem = async (req, res, next) => {
  try {
    const item = await ContentItem.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// ── Blog Posts ─────────────────────────────────────────────────────────────

exports.listPosts = async (req, res, next) => {
  try {
    const admin = req.query.admin === 'true';
    const filter = admin ? {} : { status: 'published' };
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, author, status, coverImage } = req.body;
    const postSlug = slug(title || 'post') + '-' + Date.now();
    const coverImageData = coverImage ? { url: coverImage } : undefined;
    const post = await BlogPost.create({
      title, excerpt, content, author: author || 'CHANCELOR STORE',
      status: status || 'draft', slug: postSlug,
      ...(coverImageData && { coverImage: coverImageData }),
      publishedAt: status === 'published' ? new Date() : undefined,
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { title, excerpt, content, author, status, coverImage } = req.body;
    const update = {
      title, excerpt, content,
      author: author || 'CHANCELOR STORE',
      status: status || 'draft',
    };
    if (coverImage !== undefined) update.coverImage = coverImage ? { url: coverImage } : undefined;
    if (status === 'published') update.publishedAt = new Date();
    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
