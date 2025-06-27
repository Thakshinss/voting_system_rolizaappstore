import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCandidateSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { voter_id } = req.body;
      
      if (!voter_id) {
        return res.status(400).json({ message: "Voter ID is required" });
      }
      
      const candidate = await storage.getCandidateByVoterId(voter_id);
      
      if (!candidate) {
        return res.status(401).json({ message: "Invalid voter ID" });
      }
      
      res.json({ 
        candidate: {
          id: candidate.id,
          name: candidate.name,
          voter_id: candidate.voter_id,
          has_voted: candidate.has_voted
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getAllCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Get candidates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create candidate (admin)
  app.post("/api/candidates", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      
      // Check if voter_id already exists
      const existing = await storage.getCandidateByVoterId(candidateData.voter_id);
      if (existing) {
        return res.status(400).json({ message: "Voter ID already exists" });
      }
      
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      console.error("Create candidate error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit votes
  app.post("/api/votes", async (req, res) => {
    try {
      const { voter_id, selected_candidates } = req.body;
      
      if (!voter_id || !Array.isArray(selected_candidates) || selected_candidates.length !== 3) {
        return res.status(400).json({ message: "Must select exactly 3 candidates" });
      }
      
      const voter = await storage.getCandidateByVoterId(voter_id);
      if (!voter) {
        return res.status(401).json({ message: "Invalid voter" });
      }
      
      if (voter.has_voted) {
        return res.status(400).json({ message: "You have already voted" });
      }
      
      // Validate selected candidates exist and voter is not voting for themselves
      const allCandidates = await storage.getAllCandidates();
      const candidateIds = allCandidates.map(c => c.id);
      
      for (const candidateId of selected_candidates) {
        if (!candidateIds.includes(candidateId)) {
          return res.status(400).json({ message: "Invalid candidate selected" });
        }
        if (candidateId === voter.id) {
          return res.status(400).json({ message: "Cannot vote for yourself" });
        }
      }
      
      // Create votes
      const votes = [];
      for (const candidateId of selected_candidates) {
        const vote = await storage.createVote({
          voter_id: voter.id,
          voted_for_id: candidateId
        });
        votes.push(vote);
      }
      
      // Mark voter as having voted
      await storage.updateCandidateVotingStatus(voter.id, true);
      
      res.json({ message: "Votes submitted successfully", votes });
    } catch (error) {
      console.error("Submit votes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get results
  app.get("/api/results", async (req, res) => {
    try {
      const candidates = await storage.getCandidateResults();
      const stats = await storage.getVotingStats();
      
      // Calculate percentages
      const candidatesWithPercentage = candidates.map(candidate => ({
        ...candidate,
        percentage: stats.totalVotes > 0 
          ? Math.round((candidate.votes_received / stats.totalVotes) * 100 * 10) / 10
          : 0
      }));
      
      res.json({
        candidates: candidatesWithPercentage,
        stats
      });
    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get voting status
  app.get("/api/status", async (req, res) => {
    try {
      const candidates = await storage.getAllCandidates();
      const votedCandidates = candidates.filter(c => c.has_voted);
      const pendingCandidates = candidates.filter(c => !c.has_voted);
      
      res.json({
        voted: votedCandidates,
        pending: pendingCandidates
      });
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
