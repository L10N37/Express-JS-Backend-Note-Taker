/*

 http://localhost:3000/
 ctrl+c to close server after changes, then reboot
 
 */

const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// tells Express to parse request body as JSON
app.use(express.json());

// tells Express to serve static files from the public directory
app.use(express.static('public'));

// HTML routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/notes', (req, res) => {
  res.sendFile(__dirname + '/public/notes.html');
});

// API routes
app.get("/api/notes", function(req, res) {
  // Read the db.json file
  const notes = JSON.parse(fs.readFileSync("./db/db.json"));

  // Filter out entries that have empty title and text
  const filteredNotes = notes.filter(note => note.title !== "" || note.text !== "");

  // Send the filtered notes as the response
  res.json(filteredNotes);
});


app.post('/api/notes', (req, res) => {
  const newNote = {};

  // receive new note to save on the request body
  newNote.title = req.body.title;
  newNote.text = req.body.text;

  // give new note a unique ID
  newNote.id = uuidv4();

  // read db.json file
  fs.readFile(__dirname + '/db/db.json', 'utf8', (err, data) => {
    if (err) throw err;

    // parse saved notes from JSON
    const savedNotes = JSON.parse(data);

    // add new note to saved notes array
    savedNotes.push(newNote);

    // write updated saved notes array to db.json file
    fs.writeFile(__dirname + '/db/db.json', JSON.stringify(savedNotes), (err) => {
      if (err) throw err;
      res.json(newNote);
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
    // read db.json file
    fs.readFile(__dirname + '/db/db.json', 'utf8', (err, data) => {
      if (err) throw err;
  
      // parse saved notes from JSON
      let savedNotes = JSON.parse(data);
  
      // find index of note with matching ID
      const noteIndex = savedNotes.findIndex(note => note.id === req.params.id);
  
      if (noteIndex === -1) {
        // if note not found, send 404 response
        res.status(404).send('Note not found');
      } else {
        // remove note with matching ID from saved notes array
        savedNotes.splice(noteIndex, 1);
  
        // write updated saved notes array to db.json file
        fs.writeFile(__dirname + '/db/db.json', JSON.stringify(savedNotes), (err) => {
          if (err) throw err;
          res.send('Note deleted');
        });
      }
    });
  });
  
// once deployed on render, it will set the port automatically with the variable, otherwise for local use port 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
