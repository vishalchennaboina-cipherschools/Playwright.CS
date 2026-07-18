/** Maps execution profile routes. */

const { Router } = require('express');
const ctrl = require('../controllers/profile.controller');

const router = Router();

router.get('/',     ctrl.listProfiles);
router.post('/',    ctrl.createProfile);
router.get('/:id',  ctrl.getProfile);
router.put('/:id',  ctrl.updateProfile);
router.delete('/:id', ctrl.deleteProfile);

module.exports = router;
