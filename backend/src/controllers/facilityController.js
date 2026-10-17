const Facility = require('../models/Facility');

// ➕ เพิ่ม: CRUD จัดการสนาม — ทุก endpoint เป็นแอดมินเท่านั้น (guard ไว้ที่ routes)

// @desc  List all facilities
// @route GET /api/facilities
const listFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find().sort('-createdAt');
    res.json({ facilities });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single facility
// @route GET /api/facilities/:id
const getFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'ไม่พบสนามนี้ในระบบ' });
    res.json({ facility });
  } catch (err) {
    next(err);
  }
};

// @desc  Create a facility
// @route POST /api/facilities
const createFacility = async (req, res, next) => {
  try {
    const { name, sport, address, capacity, status } = req.body;
    if (!name || !sport) {
      return res.status(400).json({ message: 'name และ sport ต้องระบุให้ครบ' });
    }

    const facility = await Facility.create({ name, sport, address, capacity, status });
    res.status(201).json({ facility });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a facility
// @route PUT /api/facilities/:id
const updateFacility = async (req, res, next) => {
  try {
    const { name, sport, address, capacity, status } = req.body;
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'ไม่พบสนามนี้ในระบบ' });

    if (name !== undefined) facility.name = name;
    if (sport !== undefined) facility.sport = sport;
    if (address !== undefined) facility.address = address;
    if (capacity !== undefined) facility.capacity = capacity;
    if (status !== undefined) facility.status = status;

    await facility.save();
    res.json({ facility });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a facility
// @route DELETE /api/facilities/:id
const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'ไม่พบสนามนี้ในระบบ' });
    await facility.deleteOne();
    res.json({ message: 'ลบสนามเรียบร้อยแล้ว' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listFacilities, getFacility, createFacility, updateFacility, deleteFacility };
