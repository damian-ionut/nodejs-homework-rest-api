const Contact = require('../models/contact');
const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const skip = (page - 1) * limit;
    const filter = { owner: req.user._id };
    if (favorite !== undefined) filter.favorite = favorite;

    const contacts = await Contact.find(filter).skip(skip).limit(Number(limit));
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { name, email, phone, favorite } = req.body;
    await contactSchema.validateAsync({ name, email, phone, favorite });

    const contact = new Contact({ ...req.body, owner: req.user._id });
    await contact.save();

    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { name, email, phone, favorite } = req.body;
    await contactSchema.validateAsync({ name, email, phone, favorite });

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
