import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  voter_id: text("voter_id").notNull().unique(),
  has_voted: boolean("has_voted").notNull().default(false),
  votes_received: integer("votes_received").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  voter_id: integer("voter_id").notNull(),
  voted_for_id: integer("voted_for_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const candidatesRelations = relations(candidates, ({ many }) => ({
  votesGiven: many(votes, { relationName: "voter" }),
  votesReceived: many(votes, { relationName: "voted_for" }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  voter: one(candidates, {
    fields: [votes.voter_id],
    references: [candidates.id],
    relationName: "voter",
  }),
  votedFor: one(candidates, {
    fields: [votes.voted_for_id],
    references: [candidates.id],
    relationName: "voted_for",
  }),
}));

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  has_voted: true,
  votes_received: true,
  created_at: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  created_at: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
