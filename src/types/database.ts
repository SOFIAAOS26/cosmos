/**
 * Hand-written Database types for the Supabase client.
 * Kept in sync with supabase/migrations/*.sql.
 *
 * When you connect the Supabase CLI you can regenerate a canonical version with:
 *   npm run db:types
 * and import from '@/types/supabase.generated'. Until then, this is the source of truth.
 */
import type {
  Identity,
  MemberRole,
  TaskPriority,
  EventType,
  NoteKind,
  CheckinMood,
  SongPlatform,
  NotificationType,
  PaperColor,
  PaperIntention,
} from './models';

type Timestamp = string; // ISO 8601 (timestamptz)
type DateStr = string; // 'YYYY-MM-DD'
type UUID = string;
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

/* ----------------------------- Row shapes ----------------------------- */

export type Profile = {
  id: UUID;
  display_name: string;
  identity: Identity;
  avatar_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type Cosmos = {
  id: UUID;
  name: string;
  timezone: string;
  created_by: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type CosmosMember = {
  id: UUID;
  cosmos_id: UUID;
  user_id: UUID;
  identity: Identity;
  role: MemberRole;
  joined_at: Timestamp;
}

export type CosmosInvite = {
  id: UUID;
  cosmos_id: UUID;
  code: string;
  created_by: UUID;
  expires_at: Timestamp | null;
  accepted_by: UUID | null;
  accepted_at: Timestamp | null;
  created_at: Timestamp;
}

export type Memory = {
  id: UUID;
  cosmos_id: UUID;
  date: DateStr;
  author_id: UUID;
  photo_url: string | null;
  story: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type MemoryMedia = {
  id: UUID;
  memory_id: UUID;
  cosmos_id: UUID;
  url: string;
  thumb_url: string | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: Timestamp;
}

export type Song = {
  id: UUID;
  cosmos_id: UUID;
  memory_id: UUID | null;
  date: DateStr | null;
  platform: SongPlatform;
  url: string;
  title: string | null;
  artist: string | null;
  thumbnail: string | null;
  created_at: Timestamp;
}

export type Sticker = {
  id: UUID;
  cosmos_id: UUID | null; // null = global/built-in library
  name: string;
  url: string;
  is_global: boolean;
  created_at: Timestamp;
}

export type MemorySticker = {
  id: UUID;
  cosmos_id: UUID;
  memory_id: UUID;
  sticker_id: UUID;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type Task = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  date: DateStr;
  title: string;
  description: string | null;
  priority: TaskPriority;
  category: string | null;
  completed: boolean;
  completed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type TaskSupport = {
  id: UUID;
  cosmos_id: UUID;
  task_id: UUID;
  from_user: UUID;
  message: string;
  created_at: Timestamp;
}

export type TaskReaction = {
  id: UUID;
  cosmos_id: UUID;
  task_id: UUID;
  from_user: UUID;
  sticker_id: UUID | null;
  emoji: string | null;
  created_at: Timestamp;
}

export type TaskCheckin = {
  id: UUID;
  cosmos_id: UUID;
  task_id: UUID;
  user_id: UUID;
  mood: CheckinMood;
  note: string | null;
  created_at: Timestamp;
}

export type CosmosEvent = {
  id: UUID;
  cosmos_id: UUID;
  title: string;
  date: DateStr;
  time: string | null; // 'HH:MM'
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  type: EventType;
  created_by: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type BucketItem = {
  id: UUID;
  cosmos_id: UUID;
  title: string;
  description: string | null;
  created_by: UUID;
  completed: boolean;
  completed_at: Timestamp | null;
  scheduled_date: DateStr | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type Countdown = {
  id: UUID;
  cosmos_id: UUID;
  title: string;
  target_date: Timestamp;
  event_id: UUID | null;
  created_by: UUID;
  is_primary: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type Note = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  recipient_id: UUID | null;
  kind: NoteKind;
  title: string | null;
  body: string;
  unlock_at: Timestamp | null;
  opened_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type Notification = {
  id: UUID;
  cosmos_id: UUID;
  user_id: UUID; // recipient
  type: NotificationType;
  payload: Json;
  read_at: Timestamp | null;
  created_at: Timestamp;
}

export type Thought = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  created_at: Timestamp;
};

export type Comet = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  recipient_id: UUID;
  note: string | null;
  image_url: string | null;
  link_url: string | null;
  seen_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Constellation = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  name: string;
  stars: string[]; // ordered star keys ("kind:id")
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type MemoryPaper = {
  id: UUID;
  cosmos_id: UUID;
  author_id: UUID;
  recipient_id: UUID | null;
  message: string;
  image_url: string | null;
  color: PaperColor;
  intention: PaperIntention;
  is_secret: boolean;
  opened_count: number;
  last_opened_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/* ------------------------- Insert / Update helpers ------------------------- */
// For inserts, server-defaulted columns are optional.

// Flatten intersections into a fresh object type so the resulting `Tables`
// object gains an implicit index signature and satisfies GenericTable.
type Simplify<T> = { [K in keyof T]: T[K] };
type Ins<T, Optional extends keyof T> = Simplify<Omit<T, Optional> & Partial<Pick<T, Optional>>>;
type ServerCols = 'id' | 'created_at' | 'updated_at';

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Ins<Profile, ServerCols | 'avatar_url'>, Partial<Profile>>;
      cosmos: Table<Cosmos, Ins<Cosmos, ServerCols | 'timezone'>, Partial<Cosmos>>;
      cosmos_members: Table<
        CosmosMember,
        Ins<CosmosMember, 'id' | 'joined_at' | 'role'>,
        Partial<CosmosMember>
      >;
      cosmos_invites: Table<
        CosmosInvite,
        Ins<
          CosmosInvite,
          'id' | 'created_at' | 'code' | 'expires_at' | 'accepted_by' | 'accepted_at'
        >,
        Partial<CosmosInvite>
      >;
      memories: Table<
        Memory,
        Ins<Memory, ServerCols | 'photo_url' | 'story'>,
        Partial<Memory>
      >;
      memory_media: Table<
        MemoryMedia,
        Ins<MemoryMedia, 'id' | 'created_at' | 'thumb_url' | 'width' | 'height' | 'position'>,
        Partial<MemoryMedia>
      >;
      songs: Table<
        Song,
        Ins<Song, 'id' | 'created_at' | 'memory_id' | 'date' | 'title' | 'artist' | 'thumbnail'>,
        Partial<Song>
      >;
      stickers: Table<
        Sticker,
        Ins<Sticker, 'id' | 'created_at' | 'cosmos_id' | 'is_global'>,
        Partial<Sticker>
      >;
      memory_stickers: Table<
        MemorySticker,
        Ins<MemorySticker, ServerCols | 'scale' | 'rotation' | 'z'>,
        Partial<MemorySticker>
      >;
      tasks: Table<
        Task,
        Ins<
          Task,
          ServerCols | 'description' | 'priority' | 'category' | 'completed' | 'completed_at'
        >,
        Partial<Task>
      >;
      task_support: Table<
        TaskSupport,
        Ins<TaskSupport, 'id' | 'created_at'>,
        Partial<TaskSupport>
      >;
      task_reactions: Table<
        TaskReaction,
        Ins<TaskReaction, 'id' | 'created_at' | 'sticker_id' | 'emoji'>,
        Partial<TaskReaction>
      >;
      task_checkins: Table<
        TaskCheckin,
        Ins<TaskCheckin, 'id' | 'created_at' | 'note'>,
        Partial<TaskCheckin>
      >;
      events: Table<
        CosmosEvent,
        Ins<
          CosmosEvent,
          | ServerCols
          | 'time'
          | 'location'
          | 'latitude'
          | 'longitude'
          | 'description'
          | 'type'
        >,
        Partial<CosmosEvent>
      >;
      bucket_items: Table<
        BucketItem,
        Ins<
          BucketItem,
          ServerCols | 'description' | 'completed' | 'completed_at' | 'scheduled_date'
        >,
        Partial<BucketItem>
      >;
      countdowns: Table<
        Countdown,
        Ins<Countdown, ServerCols | 'event_id' | 'is_primary'>,
        Partial<Countdown>
      >;
      notes: Table<
        Note,
        Ins<
          Note,
          ServerCols | 'recipient_id' | 'title' | 'unlock_at' | 'opened_at'
        >,
        Partial<Note>
      >;
      notifications: Table<
        Notification,
        Ins<Notification, 'id' | 'created_at' | 'read_at' | 'payload'>,
        Partial<Notification>
      >;
      memory_papers: Table<
        MemoryPaper,
        Ins<
          MemoryPaper,
          | ServerCols
          | 'recipient_id'
          | 'image_url'
          | 'color'
          | 'intention'
          | 'is_secret'
          | 'opened_count'
          | 'last_opened_at'
        >,
        Partial<MemoryPaper>
      >;
      thoughts: Table<
        Thought,
        Ins<Thought, 'id' | 'created_at'>,
        Partial<Thought>
      >;
      comets: Table<
        Comet,
        Ins<Comet, ServerCols | 'note' | 'image_url' | 'link_url' | 'seen_at'>,
        Partial<Comet>
      >;
      constellations: Table<
        Constellation,
        Ins<Constellation, ServerCols | 'stars'>,
        Partial<Constellation>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_cosmos: {
        Args: { p_name: string; p_identity: Identity; p_timezone: string };
        Returns: UUID;
      };
      accept_invite: {
        Args: { p_code: string; p_identity: Identity };
        Returns: UUID;
      };
      open_memory_paper: {
        Args: { p_id: UUID };
        Returns: MemoryPaper;
      };
      mark_comet_seen: {
        Args: { p_id: UUID };
        Returns: Comet;
      };
    };
    Enums: {
      identity: Identity;
      member_role: MemberRole;
      task_priority: TaskPriority;
      event_type: EventType;
      note_kind: NoteKind;
      checkin_mood: CheckinMood;
      song_platform: SongPlatform;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
}
