const { Router } = require('express');
const controller = require('../controllers/scheduleController');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.put('/:id/availability', controller.updateAvailability);

module.exports = router;
