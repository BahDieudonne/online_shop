const router = require('express').Router();
const { authenticate, isStaff, isAdmin } = require('../middleware/auth');
const c = require('../controllers/contentController');

// GET  /blog         public
// POST /blog         staff+
// PUT  /blog/:id     staff+
// DELETE /blog/:id   admin+

router.get('/',       c.listPosts);
router.post('/',      authenticate, isStaff, c.createPost);
router.put('/:id',    authenticate, isStaff, c.updatePost);
router.delete('/:id', authenticate, isAdmin, c.deletePost);

module.exports = router;
