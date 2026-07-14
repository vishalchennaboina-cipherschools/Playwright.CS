/**
 * @fileoverview Spec discovery routes.
 *
 * Mounts at: /api
 *
 * @module routes/spec.routes
 */

// const { Router } = require('express');
// const ctrl = require('../controllers/spec.controller');

// const router = Router();

// router.get('/specs', ctrl.listSpecs);

// module.exports = router;

const { Router } = require('express');
const ctrl = require('../controllers/spec.controller');

const router = Router();

console.log('[Routes] spec.routes loaded');

router.get('/specs', (req, res, next) => {
    console.log('[Routes] GET /api/specs');
    next();
}, ctrl.listSpecs);

module.exports = router;
