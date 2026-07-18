/** Maps artifact listing endpoints to controller methods. */

const { Router } = require('express');
const ctrl = require('../controllers/artifact.controller');

const router = Router();

router.get('/reports', ctrl.listReports);
router.get('/screenshots', ctrl.listScreenshots);
router.get('/videos', ctrl.listVideos);
router.get('/traces', ctrl.listTraces);
router.get('/logs', ctrl.listLogs);

module.exports = router;
