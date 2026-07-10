/**
 * @fileoverview Settings routes.
 *
 * Mounts at: /api
 *
 * @module routes/settings.routes
 */

const { Router } = require('express');
const ctrl = require('../controllers/settings.controller');

const router = Router();

router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

module.exports = router;
