
// Defines user roles within the system
export type UserRole = 'admin' | 'president' | 'guest';

// User profile structure
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string; // Linked if role is president
  name: string;
}

// Homepage Carousel Item
export interface CarouselItem {
  id: string;
  imageUrl: string;
  caption: string;
  order: number;
}

// Announcement structure
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

// Program/Event structure
export interface Program {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Disapproved';
  imageUrl?: string;
  location: string;
  organizerId?: string;
  isApproved?: boolean;
  allowRegistration?: boolean;
}

// NEW: Event Registration
export interface Registration {
  id: string;
  programId: string;
  participantName: string;
  participantEmail: string;
  registeredAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  phone?: string;
  age?: number;
  affiliation?: string;
}

// President Profile
export interface President {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  profileImage?: string;
}

// Organization Directory Entry
export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  shortDescription: string;
  fullDescription: string;
  mission?: string;
  vision?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  presidentName: string;
  presidentId?: string;
  password?: string;
}

// About Us Page Content (Dynamic Text)
export interface AboutContent {
  id: string;
  sectionTitle: string;
  content: string;
  order: number;
}

// Auth Context State
export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, role: UserRole, password?: string) => Promise<void>;
  logout: () => void;
}

// --- NEW FEATURES ---

// Showcase / Gallery
export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  dateUploaded: string;
}

// Testimonials
export interface Testimonial {
  id: string;
  authorName: string;
  role: string; // e.g., "Member", "Volunteer", "Parent"
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  dateSubmitted: string;
  avatarUrl?: string;
}

// Contact Messages
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  dateSent: string;
  status: 'New' | 'Read';
}

// Officers / Leadership
export interface Officer {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  bio: string;
  order: number;
}
