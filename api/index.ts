import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';
import { insertCandidateSchema, insertVoteSchema } from '../shared/schema';
import { fromZodError } from 'zod-validation-error';

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await storage.getAllCandidates();
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const result = insertCandidateSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({ error: validationError.message });
    }

    const candidate = await storage.createCandidate(result.data);
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { voterId } = req.body;
    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    const candidate = await storage.getCandidateByVoterId(voterId);
    if (!candidate) {
      return res.status(401).json({ error: 'Invalid voter ID' });
    }

    res.json({ user: candidate });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/votes', async (req, res) => {
  try {
    const result = insertVoteSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({ error: validationError.message });
    }

    const vote = await storage.createVote(result.data);
    await storage.updateCandidateVotingStatus(result.data.voter_id, true);
    
    res.status(201).json(vote);
  } catch (error) {
    console.error('Error creating vote:', error);
    res.status(500).json({ error: 'Failed to create vote' });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const results = await storage.getCandidateResults();
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const stats = await storage.getVotingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}