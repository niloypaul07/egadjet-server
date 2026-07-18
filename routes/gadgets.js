const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getGadgets,
  getFeaturedGadgets,
  getGadgetById,
  createGadget,
  getMyGadgets,
  deleteGadget,
  updateGadget,
  getCategories,
  getBrands,
  getStats,
} = require('../controllers/gadgetController');

const router = express.Router();

router.get('/', getGadgets);
router.get('/featured', getFeaturedGadgets);
router.get('/stats', getStats);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/my', protect, getMyGadgets);
router.get('/:id', getGadgetById);
router.post('/', protect, createGadget);
router.put('/:id', protect, updateGadget);
router.delete('/:id', protect, deleteGadget);

module.exports = router;
