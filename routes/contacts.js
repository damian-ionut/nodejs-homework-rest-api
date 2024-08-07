const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, contactsController.getContacts);
router.post('/', authenticate, contactsController.addContact);
router.get('/:id', authenticate, contactsController.getContactById);
router.put('/:id', authenticate, contactsController.updateContact);
router.delete('/:id', authenticate, contactsController.deleteContact);

module.exports = router;
