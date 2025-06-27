import { candidates, votes, type Candidate, type InsertCandidate, type Vote, type InsertVote } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Candidate operations
  getCandidate(id: number): Promise<Candidate | undefined>;
  getCandidateByVoterId(voterId: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getAllCandidates(): Promise<Candidate[]>;
  updateCandidateVotingStatus(id: number, hasVoted: boolean): Promise<void>;
  
  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByVoter(voterId: number): Promise<Vote[]>;
  
  // Statistics
  getCandidateResults(): Promise<Candidate[]>;
  getVotingStats(): Promise<{
    totalVotes: number;
    votersParticipated: number;
    remainingVoters: number;
    participationRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async getCandidateByVoterId(voterId: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.voter_id, voterId));
    return candidate || undefined;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
    return candidate;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }

  async updateCandidateVotingStatus(id: number, hasVoted: boolean): Promise<void> {
    await db
      .update(candidates)
      .set({ has_voted: hasVoted })
      .where(eq(candidates.id, id));
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    
    // Update vote count for the candidate who received the vote
    await db
      .update(candidates)
      .set({ 
        votes_received: sql`${candidates.votes_received} + 1`
      })
      .where(eq(candidates.id, insertVote.voted_for_id));
    
    return vote;
  }

  async getVotesByVoter(voterId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.voter_id, voterId));
  }

  async getCandidateResults(): Promise<Candidate[]> {
    return await db
      .select()
      .from(candidates)
      .orderBy(desc(candidates.votes_received));
  }

  async getVotingStats(): Promise<{
    totalVotes: number;
    votersParticipated: number;
    remainingVoters: number;
    participationRate: number;
  }> {
    const [totalCandidates] = await db
      .select({ count: sql<number>`count(*)` })
      .from(candidates);
    
    const [votersParticipated] = await db
      .select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(eq(candidates.has_voted, true));
    
    const [totalVotes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes);
    
    const remainingVoters = totalCandidates.count - votersParticipated.count;
    const participationRate = totalCandidates.count > 0 
      ? Math.round((votersParticipated.count / totalCandidates.count) * 100)
      : 0;
    
    return {
      totalVotes: totalVotes.count,
      votersParticipated: votersParticipated.count,
      remainingVoters,
      participationRate,
    };
  }
}

export const storage = new DatabaseStorage();
