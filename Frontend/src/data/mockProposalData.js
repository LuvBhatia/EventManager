// Mock data for Proposal Management - Reference Implementation
// This shows the static data structure that was previously used

export const mockProposals = [
  { 
    id: 1, 
    title: 'AI Workshop Series', 
    description: 'Comprehensive workshop series covering machine learning, deep learning, and AI applications',
    votes: 45, 
    status: 'pending', 
    submittedBy: 'John Doe', 
    date: '2024-01-15',
    clubName: 'Tech Innovation Club',
    type: 'WORKSHOP',
    ideaSubmissionDeadline: '2024-02-15T23:59:59Z'
  },
  { 
    id: 2, 
    title: 'Hackathon 2024', 
    description: '48-hour coding competition focused on solving real-world problems',
    votes: 78, 
    status: 'approved', 
    submittedBy: 'Jane Smith', 
    date: '2024-01-14',
    clubName: 'Coding Club',
    type: 'COMPETITION',
    ideaSubmissionDeadline: '2024-02-20T23:59:59Z'
  }
];

export const mockIdeasForProposal = {
  1: [ // Ideas for AI Workshop Series
    {
      id: 1,
      title: 'Interactive Machine Learning Workshop',
      description: 'Hands-on workshop with real ML projects and datasets. Students will build their own ML models using Python and popular libraries like scikit-learn and TensorFlow.',
      submittedByName: 'Rahul Sharma',
      upvotes: 32,
      downvotes: 0,
      status: 'APPROVED',
      createdAt: '2024-01-14T09:15:00Z'
    },
    {
      id: 2,
      title: 'Build Your Own Chatbot',
      description: 'Step-by-step guide to creating a simple chatbot using Python and natural language processing techniques.',
      submittedByName: 'Amit Kumar',
      upvotes: 25,
      downvotes: 2,
      status: 'SUBMITTED',
      createdAt: '2024-01-16T10:30:00Z'
    },
    {
      id: 3,
      title: 'AI Ethics Discussion Panel',
      description: 'Panel discussion on ethical implications of AI in society, covering bias, privacy, and responsible AI development.',
      submittedByName: 'Priya Patel',
      upvotes: 18,
      downvotes: 1,
      status: 'UNDER_REVIEW',
      createdAt: '2024-01-15T14:20:00Z'
    },
    {
      id: 4,
      title: 'Computer Vision Workshop',
      description: 'Learn image processing and computer vision techniques using OpenCV and deep learning frameworks.',
      submittedByName: 'Arjun Singh',
      upvotes: 15,
      downvotes: 3,
      status: 'SUBMITTED',
      createdAt: '2024-01-17T11:45:00Z'
    },
    {
      id: 5,
      title: 'AI in Healthcare Applications',
      description: 'Explore how artificial intelligence is revolutionizing healthcare through diagnostic tools and treatment optimization.',
      submittedByName: 'Sneha Gupta',
      upvotes: 12,
      downvotes: 0,
      status: 'SUBMITTED',
      createdAt: '2024-01-18T16:20:00Z'
    }
  ],
  2: [ // Ideas for Hackathon 2024
    {
      id: 6,
      title: 'Smart Campus Management System',
      description: 'Develop a comprehensive system for managing campus resources, student services, and administrative tasks.',
      submittedByName: 'Vikash Kumar',
      upvotes: 28,
      downvotes: 1,
      status: 'APPROVED',
      createdAt: '2024-01-16T08:30:00Z'
    },
    {
      id: 7,
      title: 'Sustainable Energy Monitoring App',
      description: 'Mobile application to track and optimize energy consumption in residential and commercial buildings.',
      submittedByName: 'Ananya Sharma',
      upvotes: 22,
      downvotes: 2,
      status: 'UNDER_REVIEW',
      createdAt: '2024-01-17T13:15:00Z'
    },
    {
      id: 8,
      title: 'Mental Health Support Platform',
      description: 'Digital platform connecting students with mental health resources, counselors, and peer support groups.',
      submittedByName: 'Rohan Mehta',
      upvotes: 19,
      downvotes: 0,
      status: 'SUBMITTED',
      createdAt: '2024-01-18T10:00:00Z'
    },
    {
      id: 9,
      title: 'Food Waste Reduction System',
      description: 'IoT-based system to track food inventory and reduce waste in cafeterias and restaurants.',
      submittedByName: 'Kavya Reddy',
      upvotes: 16,
      downvotes: 1,
      status: 'SUBMITTED',
      createdAt: '2024-01-19T14:45:00Z'
    }
  ]
};

// Function to get mock ideas sorted by upvotes
export const getMockIdeasForProposal = (proposalId) => {
  const ideas = mockIdeasForProposal[proposalId] || [];
  return ideas.sort((a, b) => b.upvotes - a.upvotes);
};

// Function to calculate total votes for a proposal
export const calculateTotalVotes = (proposalId) => {
  const ideas = mockIdeasForProposal[proposalId] || [];
  return ideas.reduce((sum, idea) => sum + idea.upvotes, 0);
};

// Updated proposals with calculated votes
export const mockProposalsWithVotes = mockProposals.map(proposal => ({
  ...proposal,
  votes: calculateTotalVotes(proposal.id)
}));
