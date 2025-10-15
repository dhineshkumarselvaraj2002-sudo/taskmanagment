# Admin Dashboard Workflow Diagram

## System Architecture Flow

```mermaid
graph TB
    A[Admin Login] --> B[Dashboard Overview]
    B --> C{Admin Actions}
    
    C --> D[User Management]
    C --> E[Task Management]
    C --> F[Calendar View]
    C --> G[Notifications]
    
    D --> D1[Add Users]
    D --> D2[Edit Users]
    D --> D3[Delete Users]
    D --> D4[List Users]
    
    E --> E1[Create Tasks]
    E --> E2[Edit Tasks]
    E --> E3[Delete Tasks]
    E --> E4[Task Listing]
    
    F --> F1[Calendar Display]
    F --> F2[Hover Tooltips]
    F --> F3[Task Details Modal]
    F --> F4[Filter Tasks]
    
    G --> G1[Auto Notifications]
    G --> G2[Manual Notifications]
    G --> G3[Mark as Read]
    G --> G4[Delete Notifications]
    
    E1 --> H[Task Assignment]
    H --> I[Generate Notification]
    I --> G1
    
    E2 --> J[Task Update]
    J --> K[Status Change]
    K --> I
    
    F1 --> L[Task Events]
    L --> M[Color Coding]
    M --> N[Interactive Calendar]
```

## Database Relationships

```mermaid
erDiagram
    User ||--o{ Task : "assigned to"
    User ||--o{ Task : "created by"
    User ||--o{ Notification : "receives"
    Task ||--o{ Notification : "generates"
    Task ||--o{ Comment : "has"
    Task ||--o{ Attachment : "has"
    Task ||--o{ TimeLog : "has"
    Task ||--o{ ChecklistItem : "has"
    Task ||--o{ ActivityLog : "has"
    
    User {
        string id PK
        string name
        string email
        string password
        string role
        boolean isActive
        boolean emailNotifications
        datetime createdAt
        datetime updatedAt
    }
    
    Task {
        string id PK
        string taskName
        string taskDescription
        datetime startDate
        datetime endDate
        string status
        string priority
        string category
        array tags
        int estimatedHours
        string assignedToId FK
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }
    
    Notification {
        string id PK
        string title
        string message
        string type
        string status
        string userId FK
        string taskId FK
        datetime createdAt
    }
```

## User Interaction Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant D as Dashboard
    participant U as User Management
    participant T as Task Management
    participant C as Calendar
    participant N as Notifications
    participant DB as Database
    
    A->>D: Login to Admin Dashboard
    D->>DB: Fetch dashboard metrics
    DB-->>D: Return stats (tasks, users, completion rate)
    D-->>A: Display dashboard overview
    
    A->>U: Navigate to User Management
    U->>DB: Fetch users list
    DB-->>U: Return users with task counts
    U-->>A: Display users table
    
    A->>U: Create new user
    U->>DB: Insert user record
    DB-->>U: Confirm user creation
    U-->>A: Show success message
    
    A->>T: Navigate to Task Management
    T->>DB: Fetch tasks list
    DB-->>T: Return tasks with assigned users
    T-->>A: Display tasks table
    
    A->>T: Create new task
    T->>DB: Insert task record
    T->>DB: Create notification for assigned user
    DB-->>T: Confirm task creation
    T-->>A: Show success message
    
    A->>C: Navigate to Calendar View
    C->>DB: Fetch tasks for date range
    DB-->>C: Return tasks as calendar events
    C-->>A: Display calendar with color-coded tasks
    
    A->>C: Click on task event
    C->>DB: Fetch full task details
    DB-->>C: Return complete task information
    C-->>A: Show task details modal
    
    A->>N: Navigate to Notifications
    N->>DB: Fetch notifications list
    DB-->>N: Return notifications with user info
    N-->>A: Display notifications table
    
    A->>N: Mark notification as read
    N->>DB: Update notification status
    DB-->>N: Confirm status update
    N-->>A: Update UI to show read status
```

## Task Assignment Workflow

```mermaid
flowchart TD
    A[Admin Creates Task] --> B[Select User to Assign]
    B --> C[Set Task Details]
    C --> D[Save Task to Database]
    D --> E[Generate Notification]
    E --> F[Send to Assigned User]
    F --> G[User Receives Notification]
    G --> H[User Views Task Details]
    H --> I[User Updates Task Status]
    I --> J[Generate Status Change Notification]
    J --> K[Admin Sees Updated Status]
    
    D --> L[Add to Calendar Events]
    L --> M[Display on Calendar View]
    M --> N[Color Code by Status/Priority]
    
    E --> O[Log Activity]
    O --> P[Update Activity Logs]
```

## Notification System Flow

```mermaid
graph LR
    A[Task Event] --> B{Event Type}
    B -->|Task Assigned| C[Generate Assignment Notification]
    B -->|Status Changed| D[Generate Status Notification]
    B -->|Priority Changed| E[Generate Priority Notification]
    B -->|Task Completed| F[Generate Completion Notification]
    B -->|Deadline Approaching| G[Generate Deadline Notification]
    
    C --> H[Send to Assigned User]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Store in Database]
    I --> J[Display in Notifications Table]
    J --> K[User Can Mark as Read]
    K --> L[Update Notification Status]
```

## Filtering and Search Flow

```mermaid
flowchart TD
    A[User Applies Filter] --> B{Filter Type}
    B -->|Search Text| C[Search in Name/Description]
    B -->|Status Filter| D[Filter by Task Status]
    B -->|Priority Filter| E[Filter by Priority Level]
    B -->|User Filter| F[Filter by Assigned User]
    B -->|Date Filter| G[Filter by Date Range]
    
    C --> H[Execute Database Query]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Return Filtered Results]
    I --> J[Update Table Display]
    J --> K[Update Pagination]
    K --> L[Show Results to User]
```

## Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B[Validate Input]
    B --> C{Validation Passed?}
    C -->|Yes| D[Process Request]
    C -->|No| E[Show Validation Error]
    
    D --> F[Execute Database Operation]
    F --> G{Operation Successful?}
    G -->|Yes| H[Show Success Message]
    G -->|No| I[Log Error]
    I --> J[Show User-Friendly Error]
    
    E --> K[User Corrects Input]
    K --> A
    J --> L[User Retries Action]
    L --> A
```

This comprehensive workflow documentation provides a complete overview of the Admin Dashboard MVP system, including user interactions, data flow, error handling, and system architecture.
