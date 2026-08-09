# Suzume Database Schema

The Prisma schema at `apps/api/prisma/schema.prisma` is the source of truth. The SQL file at `docs/database/schema.sql` is the reference relational DDL.

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ APPLICATION : owns
    USER ||--o{ LEARNING : records
    USER ||--o{ PREPARATION_PROGRESS : tracks
    USER ||--o{ PREPARATION_LOG : records
    USER ||--o{ PREPARATION_SOURCE : connects
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ PASSWORD_RESET_TOKEN : has

    COMPANY ||--o{ APPLICATION : receives
    APPLICATION ||--o{ ROUND : contains
    ROUND ||--o| EXPERIENCE : has
    EXPERIENCE ||--o{ QUESTION : contains
    LEARNING ||--o{ ACTION_ITEM : contains

    PREPARATION_TOPIC ||--o{ PREPARATION_PROGRESS : tracks
    PREPARATION_TOPIC ||--o{ PREPARATION_LOG : receives
    PREPARATION_TOPIC ||--o{ PREPARATION_TOPIC : parent_of

    USER {
        uuid id PK
        string name
        string email UK
        string password_hash
        datetime preparation_setup_completed_at
        datetime created_at
        datetime updated_at
    }

    REFRESH_TOKEN {
        uuid id PK
        uuid user_id FK
        string token_hash
        datetime expires_at
        datetime revoked_at
        datetime created_at
    }

    PASSWORD_RESET_TOKEN {
        uuid id PK
        uuid user_id FK
        string token_hash
        datetime expires_at
        datetime used_at
        datetime created_at
    }

    COMPANY {
        uuid id PK
        string name UK
        string website
        string description
        datetime created_at
        datetime updated_at
    }

    APPLICATION {
        uuid id PK
        uuid user_id FK
        uuid company_id FK
        string role
        string location
        datetime application_date
        datetime deadline
        boolean internship
        enum ppo_type
        decimal stipend
        decimal ctc
        enum status
        enum source
        datetime created_at
        datetime updated_at
    }

    ROUND {
        uuid id PK
        uuid application_id FK
        enum type
        string title
        datetime scheduled_at
        int duration
        enum mode
        enum status
        string notes
        enum source
    }

    EXPERIENCE {
        uuid id PK
        uuid round_id FK_UK
        string summary
        string what_went_well
        string what_went_badly
        int confidence
        string overall_reflection
        string_array topics_covered
    }

    QUESTION {
        uuid id PK
        uuid experience_id FK
        string question
        enum category
        string topic
        enum difficulty
        enum performance
        string notes
    }

    LEARNING {
        uuid id PK
        uuid user_id FK
        string title
        string description
        enum category
        enum priority
        string source_type
        string source_id
        enum status
    }

    ACTION_ITEM {
        uuid id PK
        uuid learning_id FK
        string title
        string description
        enum status
        datetime due_date
        datetime completed_at
    }

    PREPARATION_TOPIC {
        uuid id PK
        string name
        string category
        uuid parent_id FK
        uuid user_id FK
        boolean is_custom
    }

    PREPARATION_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid topic_id FK
        int initial_level
        int questions_solved
        int questions_total
        int confidence
        datetime last_practiced
    }

    PREPARATION_LOG {
        uuid id PK
        uuid user_id FK
        uuid topic_id FK
        date date
        int questions_solved
        int duration_minutes
        string notes
    }

    PREPARATION_SOURCE {
        uuid id PK
        uuid user_id FK
        string provider
        string profile_url
        json metrics
        datetime last_synced_at
        string last_sync_error
    }
```

## Main Design Decisions

### Applications and recruitment rounds

`Application` is the user's placement opportunity. `Round` represents each recruitment stage under that application. A round's scheduled date is the source used by the calendar and upcoming-round views.

### Interview experience

`Experience` is one-to-one with a `Round`. `Question` records individual interview questions under that experience.

### Learnings

`Learning` belongs to a user and can have multiple `ActionItem` records. This creates the chain from reflection to concrete improvement work.

### Preparation

`PreparationTopic` represents default or user-created subjects and supports a parent/child hierarchy. `PreparationProgress` stores the current preparation state and initial assessment. `PreparationLog` stores actual dated study activity.

Keeping progress and logs separate prevents a study log from silently overwriting a user's self-assessed preparation level.

### External preparation sources

`PreparationSource` stores a provider, profile URL, last known normalized metrics, and sync metadata. It is intentionally separate from `PreparationLog` and `PreparationProgress`, so removing an external source cannot delete Suzume-owned preparation history.
