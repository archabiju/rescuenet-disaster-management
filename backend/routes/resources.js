const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.get('/resources', resourceController.getAllResources);
router.get('/centers', resourceController.getAllCenters);
router.get('/inventory', resourceController.getAllInventories);
router.get('/inventory/:centerId', resourceController.getInventoryByCenter);
router.post('/inventory', resourceController.updateInventory);

module.exports = router;