/**
 * @fileoverview Execution routes.
 *
 * Maps HTTP verbs to execution controller methods.
 * Validation middleware is applied per-route.
 *
 * Mounts at: /api/executions
 *
 * @module routes/execution.routes
 */

const { Router } = require('express');
const ctrl = require('../controllers/execution.controller');
const { validateStartExecution, validateExecId } = require('../middleware/validation');

const router = Router();

router.post('/', validateStartExecution, ctrl.startExecution);
router.get('/', ctrl.listExecutions);
router.get('/:id', validateExecId, ctrl.getExecution);
router.post('/:id/stop', validateExecId, ctrl.stopExecution);
router.delete('/:id', validateExecId, ctrl.deleteExecution);

module.exports = router;
