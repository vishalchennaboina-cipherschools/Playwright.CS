/** Maps spec discovery routes. */

const { Router } = require('express');
const ctrl = require('../controllers/spec.controller');
const logger = require('../utils/logger');

const router = Router();

logger.debug('[Routes] spec.routes loaded', { category: logger.CATEGORIES.API });

router.get('/specs', (req, res, next) => {
    logger.debug('[Routes] GET /api/specs', { category: logger.CATEGORIES.API });
    next();
}, ctrl.listSpecs);

module.exports = router;
