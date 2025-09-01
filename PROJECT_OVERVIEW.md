# 🎪 Event Idea Marketplace for Clubs

## 📋 Project Overview

The Event Idea Marketplace for Clubs is a full-stack platform designed to foster creativity and collaboration within a university ecosystem.

### 🎯 **Problem Addressed**
University clubs often face challenges in brainstorming fresh and engaging ideas for their events. Traditional brainstorming sessions are limited by:
- Small group perspectives
- Time constraints
- Limited creative input
- Difficulty in evaluating ideas objectively

### 💡 **Proposed Solution**
The platform creates a collaborative ecosystem where:
- **Clubs** post event-related problems, themes, or requirements
- **Students** submit creative proposals or solutions
- **Community** votes and provides feedback on submissions
- **Clubs** review top-voted ideas and adopt them for execution

## 🏗️ **System Architecture**

### **Backend (Spring Boot + Neon PostgreSQL)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │     Services    │    │   Repositories  │
│                 │    │                 │    │                 │
│ • Auth         │    │ • User          │    │ • User          │
│ • Club         │    │ • Club          │    │ • Club          │
│ • Problem      │    │ • Problem       │    │ • Problem       │
│ • Idea         │    │ • Idea          │    │ • Idea          │
│ • Vote         │    │ • Vote          │    │ • Vote          │
│ • Comment      │    │ • Comment       │    │ • Comment       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Neon Database │
                    │                 │
                    │ • Users        │
                    │ • Clubs        │
                    │ • Problems     │
                    │ • Ideas        │
                    │ • Votes        │
                    │ • Comments     │
                    └─────────────────┘
```

### **Frontend (React + Vite)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Pages       │    │   Components    │    │      API       │
│                 │    │                 │    │                 │
│ • Home         │    │ • Navbar        │    │ • Auth          │
│ • Login        │    │ • ClubCard      │    │ • Club          │
│ • Register     │    │ • ProblemCard   │    │ • Problem      │
│ • Dashboard    │    │ • IdeaCard      │    │ • Idea          │
│ • Problems     │    │ • VoteButton    │    │ • Vote          │
│ • Ideas        │    │ • CommentForm   │    │ • Comment      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ **Database Schema**

### **Core Entities**

#### **1. User**
- Basic user information (name, email, password)
- Role-based access (STUDENT, CLUB_ADMIN, SUPER_ADMIN)
- Timestamps for audit trail

#### **2. Club**
- Club details (name, description, category)
- Statistics (member count, event count, rating)
- Admin user relationship
- Active/inactive status

#### **3. Problem**
- Event challenges posted by clubs
- Detailed requirements and constraints
- Status tracking (OPEN, REVIEWING, IMPLEMENTING, COMPLETED, CLOSED)
- Metrics (view count, idea count)

#### **4. Idea**
- Creative solutions submitted by students
- Implementation details and resources
- Status tracking (SUBMITTED, UNDER_REVIEW, APPROVED, IMPLEMENTING, COMPLETED, REJECTED)
- Metrics (vote count, comment count)

#### **5. Vote**
- Community voting on ideas
- Upvote/downvote system
- Unique constraint per user per idea
- Timestamp for audit

#### **6. Comment**
- Feedback and discussions on ideas
- Nested comments support
- Like system for engagement
- Edit tracking

## 🚀 **Key Features**

### **1. Club Management**
- ✅ Club registration and profile management
- ✅ Problem posting with detailed requirements
- ✅ Idea review and selection system
- ✅ Club statistics and analytics

### **2. Problem Posting**
- ✅ Rich problem descriptions
- ✅ Category classification
- ✅ Deadline and budget constraints
- ✅ Expected participant count
- ✅ Status tracking throughout lifecycle

### **3. Idea Submission**
- ✅ Creative proposal submission
- ✅ Implementation details
- ✅ Resource requirements
- ✅ Cost and duration estimates
- ✅ Expected outcomes

### **4. Community Engagement**
- ✅ Upvote/downvote system
- ✅ Comment and discussion threads
- ✅ Idea ranking and sorting
- ✅ Featured ideas highlighting

### **5. User Experience**
- ✅ Modern, responsive UI
- ✅ Real-time updates
- ✅ Search and filtering
- ✅ Category-based navigation
- ✅ User dashboard and profiles

## 🔐 **Security & Access Control**

### **Role-Based Access Control**
- **STUDENT**: Submit ideas, vote, comment
- **CLUB_ADMIN**: Manage club, post problems, review ideas
- **SUPER_ADMIN**: Platform administration

### **Data Protection**
- Password hashing with secure algorithms
- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention

## 📱 **User Interface Features**

### **Homepage**
- Hero section with platform overview
- Featured problems and ideas
- Club discovery
- Statistics and engagement metrics

### **Problem Browsing**
- Category-based filtering
- Search functionality
- Status-based sorting
- Deadline awareness

### **Idea Submission**
- Rich text editor
- File attachment support
- Preview functionality
- Draft saving

### **Voting System**
- One vote per user per idea
- Real-time vote count updates
- Vote history tracking
- Engagement analytics

## 🔄 **Workflow Process**

### **1. Problem Posting (Club Admin)**
```
Club Admin → Create Problem → Set Requirements → Set Deadline → Publish
```

### **2. Idea Submission (Student)**
```
Student → Browse Problems → Submit Idea → Add Details → Submit for Review
```

### **3. Community Engagement**
```
Community → View Ideas → Vote → Comment → Discuss → Share
```

### **4. Idea Selection (Club)**
```
Club → Review Ideas → Evaluate Votes → Select Winner → Implement
```

## 📊 **Analytics & Insights**

### **Club Analytics**
- Problem engagement metrics
- Idea submission trends
- Community response rates
- Implementation success rates

### **User Analytics**
- Participation statistics
- Idea acceptance rates
- Community contribution scores
- Engagement patterns

### **Platform Analytics**
- Overall platform usage
- Popular categories
- Peak activity times
- User retention metrics

## 🚀 **Deployment & Infrastructure**

### **Backend**
- **Framework**: Spring Boot 3.x
- **Database**: Neon PostgreSQL (Cloud)
- **Authentication**: JWT
- **API**: RESTful endpoints
- **Security**: Spring Security

### **Frontend**
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS3 with modern features
- **Routing**: React Router DOM
- **State Management**: React Hooks

### **Database**
- **Provider**: Neon.tech
- **Type**: PostgreSQL
- **Features**: Auto-scaling, SSL, backups
- **Region**: US East 1

## 🔮 **Future Enhancements**

### **Phase 2 Features**
- Real-time notifications
- Mobile app development
- Advanced analytics dashboard
- Integration with calendar systems
- Social media sharing

### **Phase 3 Features**
- AI-powered idea recommendations
- Advanced search with ML
- Gamification elements
- Multi-university support
- API for third-party integrations

## 📈 **Success Metrics**

### **User Engagement**
- Daily active users
- Problem submission rate
- Idea submission rate
- Community voting participation

### **Platform Health**
- User retention rates
- Problem resolution time
- Idea implementation success
- Community satisfaction scores

### **Business Impact**
- Events created from platform ideas
- Student participation increase
- Club engagement improvement
- University community building

---

## 🎯 **Getting Started**

1. **Backend**: Start Spring Boot application
2. **Database**: Verify Neon connection
3. **Frontend**: Run React development server
4. **Testing**: Create test users and sample data
5. **Deployment**: Deploy to production environment

---

*This platform transforms how university clubs approach event planning by leveraging the collective creativity of the entire student body.*
