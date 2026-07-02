const router = require('express').Router();
const { authenticate, isAdmin, isStaff } = require('../middleware/auth');
const c = require('../controllers/contentController');

// ── Content items: banners / faqs / testimonials ───────────────────────────
// GET  /content/:type          — public
// POST /content/:type          — staff+
// PUT  /content/:type/:id      — staff+
// DELETE /content/:type/:id    — admin+
// PATCH /content/:type/:id     — staff+ (toggle active / reorder)

router.get('/:type',        c.listItems);
router.post('/:type',       authenticate, isStaff, c.createItem);
router.put('/:type/:id',    authenticate, isStaff, c.updateItem);
router.delete('/:type/:id', authenticate, isAdmin, c.deleteItem);
router.patch('/:type/:id',  authenticate, isStaff, c.patchItem);

module.exports = router;
