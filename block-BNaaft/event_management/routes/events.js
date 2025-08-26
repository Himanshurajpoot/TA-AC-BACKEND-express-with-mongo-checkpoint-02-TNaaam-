var express = require('express');
var router = express.Router();
let Event = require('../models/Event');
let Remark = require('../models/Remark');
let multer = require('multer');
let path = require('path');
const fs = require('fs').promises;

const imagePath = path.join(__dirname, '../public/images');

// image
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });
// books form
router.get('/new', async (req, res, next) => {
  try {
    await res.render('eventForm');
  } catch (err) {
    next(err);
  }
});


// list all events
// filter events by category, location, and sort by date

router.get("/", async (req, res, next) => {
  try {
    const { category, location, sort } = req.query;

    let filter = {};

    // ✅ Match a category inside the array
    if (category) {
      filter.categories = { $regex: new RegExp(category, "i") };
    }

    // ✅ Match location
    if (location) {
      filter.location = { $regex: new RegExp(location, "i") };
    }

    let query = Event.find(filter);

    // ✅ Sort if needed
    if (sort === "latest") {
      query = query.sort({ start_date: -1 });
    } else if (sort === "oldest") {
      query = query.sort({ start_date: 1 });
    }

    const events = await query.exec();
    console.log("Filter:", filter);
    res.render("events", { events });
  } catch (err) {
    next(err);
  }
});



// Create a new event
router.post('/', upload.single('cover_image'), async (req, res, next) => {
  try {
    let eventData = req.body;
    if (req.file) {
      eventData.cover_image = req.file.filename;
    }

    let event = await Event.create(eventData);
    console.log(event);
    res.redirect('/events');
  } catch (err) {
    next(err);
  }
});

// Get a single event by ID
router.get('/:id', async (req, res, next) => {
  try {
    let id = req.params.id;
    let event = await Event.findById(id).populate('remarks').exec();
    res.render('singleEvent', { event });
  } catch (err) {
    next(err);
  }
});

// Update an event
router.get('/:id/edit', async (req, res, next) => {
  try {
    let id = req.params.id;
    let event = await Event.findById(id);
    res.render('updateEvent', { event });
  } catch (err) {
    next(err);
  }
});




// Update an event with image upload
router.post('/:id', upload.single('cover_image'), async (req, res, next) => {
  try {
    let id = req.params.id;
    let updatedData = req.body;
    let existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).send('Book not found');
    }

    // If new image is uploaded, delete old one
    if (req.file) {
      let oldImg = updatedData.cover_image;
      if (oldImg) {
        let oldImgPath = path.join(imagePath, oldImg);
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }
      // Add new image filename
      updatedData.cover_image = req.file.filename;
    }
    let event = await Event.findByIdAndUpdate(id, updatedData);
    res.redirect('/events/' + id);
  } catch (err) {
    next(err);
  }
});

// Delete an event
router.get('/:id/delete', async (req, res, next) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Delete the image file if it exists
    if (event.cover_image) {
      const coverPath = path.join(imagePath, event.cover_image);
      try {
        await fs.unlink(coverPath);
        console.log('Deleted image:', event.cover_image);
      } catch (err) {
        console.warn("Image not found or couldn't be deleted:", err.message);
      }
    }

    // Delete the event
    await Event.findByIdAndDelete(id);
    await Remark.deleteMany({ eventId: event.id });
    res.redirect('/events');
  } catch (err) {
    next(err);
  }
});

// like


// like an event
router.get('/:id/like', async (req, res, next) => {
  try {
    let id = req.params.id;
    let event = await Event.findByIdAndUpdate(id, { $inc: { likes: +1 } });
    res.redirect('/events/' + id);
  } catch (err) {
    next(err);
  }
});

// dislike

router.get('/:id/dislike', async (req, res, next) => {
  try {
    let id = req.params.id;
    let event = await Event.findByIdAndUpdate(id, { $inc: { dislikes: +1 } });
    res.redirect('/events/' + id);
  } catch (err) {
    next(err);
  }
});

// remark

// Add a remark to an event
router.post('/:id/remark', async (req, res, next) => {
  try {
    let id = req.params.id;
    req.body.eventId = id;
    let remark = await Remark.create(req.body);
    let event = await Event.findByIdAndUpdate(
      id,
      { $push: { remarks: remark.id } },
      { new: true }
    );
    res.redirect('/events/' + id);
  } catch (err) {
    next(err);
  }
});








module.exports = router;
