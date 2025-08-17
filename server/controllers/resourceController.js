import Note from "../models/Note.js";

// Get all notes by dept/year/subject (all params are dynamic)
export const getNotesByDept = async (req, res) => {
  const { dept, year, subject } = req.params;

  try {
    let query = { dept };

    if (year) query.year = year;
    if (subject) query.subject = subject.replace(/-/g, " ");

    const notes = await Note.find(query);
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes", error: err.message });
  }
};

// POST new note
export const createNote = async (req, res) => {
  const { dept, year, subject, title, category, link } = req.body;

  if (!dept || !year || !subject || !title || !category || !link) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const note = new Note({ dept, year, subject, title, category, link });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to create note", error: err.message });
  }
};
