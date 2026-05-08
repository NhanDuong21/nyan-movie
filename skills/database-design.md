# Database Schema & Data Models

Utilizing MongoDB with Mongoose. Strict typing and schema validations are enforced.

## 1. Collections & Schema Definitions

### Users
- _id: ObjectId
- username, email: String, unique: true, required, indexed.
- password: String (select: false by default to prevent accidental leakage).
- role: String, enum: ['user', 'admin'], default: 'user'.
- isActive: Boolean, default: true.

### Movies
- _id: ObjectId
- title: String, required.
- slug: String, unique, required, indexed for SEO routing.
- type: String, enum: ['single', 'series'].
- genres, country, year: ObjectId references (Populated on read).
- status: String, enum: ['ongoing', 'completed', 'hidden'].

### Episodes
- _id: ObjectId
- movie: ObjectId, ref: 'Movie', index: true.
- name: String.
- episodeNumber: Number.
- videoUrl: String.
- Indexing: Compound index on { movie: 1, episodeNumber: 1 } for fast sorting.

### Interactions (Consolidated)
- _id: ObjectId
- user: ObjectId, ref: 'User'.
- movie: ObjectId, ref: 'Movie'.
- type: String, enum: ['favorite', 'history'].
- episode: ObjectId, ref: 'Episode' (Tracks progress for history).
- Indexing: { user: 1, type: 1 } for fast profile dashboard queries.

## 2. Query Optimization & Relationships
- Population: Mongoose `.populate()` is heavily used for Movie Details to fetch Genres, Country, and Year in a single query.
- Soft Deletes: Implemented via status flags to maintain referential integrity.