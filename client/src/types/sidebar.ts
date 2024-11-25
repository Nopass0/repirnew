import { z } from "zod";

export enum SidebarPage {
  Home = "home",
  StudentCards = "studentCards",
  GroupCards = "groupCards",
  ClientCards = "clientCards",
}

export enum CardType {
  Create = "create",
  Edit = "edit",
  View = "view",
}

// Zod schema for a card
export const cardSchema = z.object({
  type: z.nativeEnum(CardType),
  id: z.string().uuid().optional(), // UUID format for IDs
});

// Zod schema for the sidebar state
export const sidebarStateSchema = z.object({
  currentPage: z.nativeEnum(SidebarPage),
  currentCard: cardSchema.nullable(), // Nullable because there might be no card open
});

// TypeScript types generated from Zod schemas
export type SidebarState = z.infer<typeof sidebarStateSchema>;
export type Card = z.infer<typeof cardSchema>;
