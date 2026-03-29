import type { Database } from './database.types';

export type Spot = Database['public']['Tables']['spots']['Row'];
export type SpotInsert = Database['public']['Tables']['spots']['Insert'];
export type SpotUpdate = Database['public']['Tables']['spots']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type Discovery = Database['public']['Tables']['discoveries']['Row'];
export type DiscoveryInsert = Database['public']['Tables']['discoveries']['Insert'];

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type UserProfileInsert = Database['public']['Tables']['users']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['users']['Update'];
