const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000; // or any other port you prefer

// Connect to MongoDB database
mongoose.connect('mongodb://localhost/tournament', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
	.then(() => console.log('Connected to MongoDB'))
	.catch(error => console.error('Error connecting to MongoDB:', error));

// Define schema for tournaments and participants
const tournamentSchema = new mongoose.Schema({
	name: String,
	startDate: Date,
	endDate: Date,
	status: { type: String, default: 'created' }
});
const Tournament = mongoose.model('Tournament', tournamentSchema);

const participantSchema = new mongoose.Schema({
	name: String,
	score: { type: Number, default: 0 },
	tournamentId: String
});
const Participant = mongoose.model('Participant', participantSchema);

// Define middleware to parse JSON data in requests
app.use(express.json());

// Define routes for creating, reading, updating, and deleting tournaments
app.post('/tournaments', async (req, res) => {
	const { name, startDate, endDate } = req.body;
	// Validate input data before creating new tournament
	const tournament = new Tournament({
		name,
		startDate,
		endDate,
		participants: []
	});
	await tournament.save();
	res.status(201).json(tournament);
});

app.get('/tournaments/:id', async (req, res) => {
	const { id } = req.params;
	// Fetch tournament with given ID from database
	const tournament = await Tournament.findById(id);
	if (!tournament) {
		return res.status(404).send();
	}
	res.json(tournament);
});

app.put('/tournaments/:id', async (req, res) => {
	const { id } = req.params;
	const { name, startDate, endDate } = req.body;
	// Validate input data before updating tournament
	const tournament = await Tournament.findByIdAndUpdate(id, {
		name,
		startDate,
		endDate
	}, { new: true });
	if (!tournament) {
		return res.status(404).send();
	}
	res.json(tournament);
});

app.delete('/tournaments/:id', async (req, res) => {
	const { id } = req.params;
	// Delete tournament with given ID from database
	const result = await Tournament.findByIdAndDelete(id);
	if (!result) {
		return res.status(404).send();
	}
	res.status(204).send();
});

// Define routes for creating, reading, updating, and deleting participants in a tournament
app.post('/tournaments/:id/participants', async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	// Validate input data before adding new participant to tournament
	const participant = new Participant({
		name,
		tournamentId: id
	});
	await participant.save();
	res.status(201).json(participant);
});

app.get('/tournaments/:id/participants', async (req, res) => {
	const { id } = req.params;
	// Fetch all participants for tournament with given ID from database
	const participants = await Participant.find({ tournamentId: id });
	res.json(participants);
});

app.put('/tournaments/:id/participants/:name', async (req, res) => {
    const { id, name } = req.params;
    // Validate input data before updating participant in tournament
    const { score } = req.body;
    const participant = await Participant.findOneAndUpdate({
		name,
		tournamentId: id
    }, { score }, { new: true });
    if (!participant) {
        return res.status(404).send();
    }
    res.json(participant);
});

app.delete('/tournaments/:id/participants/:name', async (req, res) => {
    const { id, name } = req.params;
    // Delete participant with given name from tournament with given ID
    const result = await Participant.deleteOne({
        name,
        tournamentId: id
    });
    if (!result.deletedCount) {
        return res.status(404).send();
    }
    res.status(204).send();
});
  
  // Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});