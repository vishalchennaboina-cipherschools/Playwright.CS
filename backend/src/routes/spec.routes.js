/**
 * @fileoverview Spec discovery routes.
 *
 * Mounts at: /api
 *
 * @module routes/spec.routes
 */

const { Router } = require('express');
const ctrl = require('../controllers/spec.controller');

const router = Router();

router.get('/specs', ctrl.listSpecs);

module.exports = router;
