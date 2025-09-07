// Server-safe exports (interfaces and services)
export * from "./interfaces/user";
export * from "./interfaces/auth-types";
export * from "./services/auth.services";
export * from "./services/auth-v2.services";

// Client-only exports are NOT included here
// Import hooks directly: import { useLoginV2 } from "@/features/auth/hooks/use-auth-v2";
