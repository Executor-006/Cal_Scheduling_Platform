const { Router } = require('express');
const controller = require('../controllers/dateOverrideController');

const router = Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
