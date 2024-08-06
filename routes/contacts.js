const express = require('express');
const { getContacts, addContact, getContactById, updateContact, deleteContact } = require('../controllers/contacts');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getContacts);
router.post('/', addContact);
router.get('/:id', getContactById);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
