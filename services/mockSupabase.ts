import {
  Announcement,
  CarouselItem,
  Program,
  Organization,
  AboutContent,
  User,
  President,
  Registration,
  GalleryItem,
  Testimonial,
  ContactMessage,
  Officer,
} from "../types";

/**
 * MOCK SUPABASE SERVICE
 */

const DELAY_MS = 600;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Initial Mock Data ---

const initialCarousel: CarouselItem[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/1200/500?random=1",
    caption: "Empowering Youth Leadership",
    order: 1,
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/1200/500?random=2",
    caption: "Community Service Initiatives",
    order: 2,
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Annual General Meeting",
    content:
      "Join us for the AGM on October 25th. All members are required to attend.",
    date: "2023-10-25",
    imageUrl: "https://picsum.photos/400/250?random=3",
  },
  {
    id: "2",
    title: "Fundraising Gala",
    content: "Our biggest event of the year is coming up. Tickets on sale now.",
    date: "2023-11-10",
    imageUrl: "https://picsum.photos/400/250?random=4",
  },
];

const initialPrograms: Program[] = [
  {
    id: "1",
    title: "Youth Tech Bootcamp",
    description: "A weekend of coding and innovation for high school students.",
    date: "2023-09-15",
    status: "Completed",
    location: "Tech Hub Center",
    imageUrl: "https://picsum.photos/400/250?random=5",
    organizerId: "1",
    isApproved: true,
    allowRegistration: true,
  },
  {
    id: "2",
    title: "Green Earth Cleanup",
    description: "Community park cleanup initiative.",
    date: "2023-10-22",
    status: "Upcoming",
    location: "Central Park",
    imageUrl: "https://picsum.photos/400/250?random=6",
    organizerId: "2",
    isApproved: true,
    allowRegistration: true,
  },
];

const initialPresidents: President[] = [
  {
    id: "1",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "555-0101",
    status: "Active",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "555-0102",
    status: "Active",
  },
  {
    id: "3",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.j@example.com",
    phone: "555-0103",
    status: "Inactive",
  },
];

const initialOrgs: Organization[] = [
  {
    id: "1",
    name: "Innovators Club",
    logoUrl: "https://picsum.photos/100/100?random=7",
    shortDescription: "Fostering innovation among youth.",
    fullDescription:
      "The Innovators Club is dedicated to helping young minds explore STEM fields through workshops, hackathons, and mentorship programs.",
    mission: "To inspire the next generation of creators and problem solvers.",
    vision:
      "A world where every young person has the tools to build their dreams.",
    contactEmail: "contact@innovators.org",
    contactPhone: "555-0101",
    presidentName: "Jane Doe",
    presidentId: "1",
    website: "https://innovators.example.org",
    password: "password123",
  },
  {
    id: "2",
    name: "Arts Collective",
    logoUrl: "https://picsum.photos/100/100?random=8",
    shortDescription: "Promoting local arts and culture.",
    fullDescription:
      "A collective of young artists working together to beautify the city and host exhibitions.",
    mission: "Bringing color and creativity to our community streets.",
    vision: "A vibrant city culture driven by youth expression.",
    contactEmail: "art@collective.org",
    contactPhone: "555-0102",
    presidentName: "John Smith",
    presidentId: "2",
    password: "password123",
  },
];

const initialAbout: AboutContent[] = [
  {
    id: "1",
    sectionTitle: "Our Mission",
    content:
      "To empower the next generation of leaders through service, innovation, and collaboration.",
    order: 1,
  },
  {
    id: "2",
    sectionTitle: "Our History",
    content:
      "Founded in 2010, we have grown from a small local group to a national network of youth organizations.",
    order: 2,
  },
];

const initialGallery: GalleryItem[] = [
  {
    id: "1",
    title: "Summer Camp 2023",
    imageUrl: "https://picsum.photos/600/400?random=10",
    dateUploaded: "2023-07-15",
  },
  {
    id: "2",
    title: "Charity Drive",
    imageUrl: "https://picsum.photos/600/400?random=11",
    dateUploaded: "2023-08-20",
  },
];

const initialTestimonials: Testimonial[] = [
  {
    id: "1",
    authorName: "Sarah Lee",
    role: "Parent",
    content:
      "This organization has changed my son's life. He is more confident and engaged.",
    status: "Approved",
    dateSubmitted: "2023-09-01",
  },
  {
    id: "2",
    authorName: "Mike Chen",
    role: "Volunteer",
    content: "A wonderful community to be a part of. Highly recommend joining.",
    status: "Pending",
    dateSubmitted: "2023-10-05",
  },
];

const initialOfficers: Officer[] = [
  {
    id: "1",
    name: "Emily Davis",
    position: "Executive Director",
    bio: "Emily has over 10 years of experience in non-profit management.",
    imageUrl: "https://picsum.photos/200/200?random=20",
    order: 1,
  },
  {
    id: "2",
    name: "David Wilson",
    position: "Community Manager",
    bio: "David loves connecting people and building strong networks.",
    imageUrl: "https://picsum.photos/200/200?random=21",
    order: 2,
  },
];

const initialRegistrations: Registration[] = [];
const initialMessages: ContactMessage[] = [];

// --- LocalStorage Helpers ---

const getFromStorage = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const saveToStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API Methods ---

export const mockDb = {
  carousel: {
    getAll: async (): Promise<CarouselItem[]> => {
      await delay(DELAY_MS);
      return getFromStorage("carousel", initialCarousel);
    },
    update: async (items: CarouselItem[]) => {
      await delay(DELAY_MS);
      saveToStorage("carousel", items);
    },
  },
  announcements: {
    getAll: async (): Promise<Announcement[]> => {
      await delay(DELAY_MS);
      return getFromStorage("announcements", initialAnnouncements);
    },
    add: async (item: Omit<Announcement, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Announcement[]>(
        "announcements",
        initialAnnouncements
      );
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("announcements", [newItem, ...current]);
      return newItem;
    },
    update: async (item: Announcement) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Announcement[]>(
        "announcements",
        initialAnnouncements
      );
      const index = current.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        current[index] = item;
        saveToStorage("announcements", current);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Announcement[]>(
        "announcements",
        initialAnnouncements
      );
      saveToStorage(
        "announcements",
        current.filter((x) => x.id !== id)
      );
    },
  },
  programs: {
    getAll: async (): Promise<Program[]> => {
      await delay(DELAY_MS);
      return getFromStorage("programs", initialPrograms);
    },
    add: async (item: Omit<Program, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Program[]>("programs", initialPrograms);
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("programs", [newItem, ...current]);
      return newItem;
    },
    update: async (item: Program) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Program[]>("programs", initialPrograms);
      const index = current.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        current[index] = item;
        saveToStorage("programs", current);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Program[]>("programs", initialPrograms);
      saveToStorage(
        "programs",
        current.filter((x) => x.id !== id)
      );
    },
  },
  registrations: {
    getAll: async (): Promise<Registration[]> => {
      await delay(DELAY_MS);
      return getFromStorage("registrations", initialRegistrations);
    },
    getByProgramId: async (programId: string): Promise<Registration[]> => {
      await delay(DELAY_MS);
      const all = getFromStorage<Registration[]>(
        "registrations",
        initialRegistrations
      );
      return all.filter((r) => r.programId === programId);
    },
    add: async (item: Omit<Registration, "id" | "registeredAt" | "status">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Registration[]>(
        "registrations",
        initialRegistrations
      );

      // DUPLICATE CHECK
      const isDuplicate = current.some(
        (r) =>
          r.programId === item.programId &&
          r.participantEmail.toLowerCase() ===
            item.participantEmail.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error("This email is already registered for this program.");
      }

      const newItem: Registration = {
        ...item,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
        status: "Pending", // Default status
      };
      saveToStorage("registrations", [...current, newItem]);
      return newItem;
    },
    update: async (item: Registration) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Registration[]>(
        "registrations",
        initialRegistrations
      );
      const index = current.findIndex((r) => r.id === item.id);
      if (index !== -1) {
        current[index] = item;
        saveToStorage("registrations", current);
      }
    },
  },
  presidents: {
    getAll: async (): Promise<President[]> => {
      await delay(DELAY_MS);
      return getFromStorage("presidents", initialPresidents);
    },
    add: async (item: Omit<President, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<President[]>(
        "presidents",
        initialPresidents
      );
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("presidents", [newItem, ...current]);
      return newItem;
    },
    update: async (item: President) => {
      await delay(DELAY_MS);
      const current = getFromStorage<President[]>(
        "presidents",
        initialPresidents
      );
      const index = current.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        current[index] = item;
        saveToStorage("presidents", current);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<President[]>(
        "presidents",
        initialPresidents
      );
      saveToStorage(
        "presidents",
        current.filter((x) => x.id !== id)
      );
    },
  },
  organizations: {
    getAll: async (): Promise<Organization[]> => {
      await delay(DELAY_MS);
      return getFromStorage("organizations", initialOrgs);
    },
    add: async (item: Omit<Organization, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Organization[]>(
        "organizations",
        initialOrgs
      );
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("organizations", [newItem, ...current]);
      return newItem;
    },
    update: async (org: Organization) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Organization[]>(
        "organizations",
        initialOrgs
      );
      const index = current.findIndex((o) => o.id === org.id);
      if (index >= 0) {
        current[index] = org;
        saveToStorage("organizations", current);
      } else {
        saveToStorage("organizations", [...current, org]);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Organization[]>(
        "organizations",
        initialOrgs
      );
      saveToStorage(
        "organizations",
        current.filter((x) => x.id !== id)
      );
    },
  },
  about: {
    getAll: async (): Promise<AboutContent[]> => {
      await delay(DELAY_MS);
      return getFromStorage("about", initialAbout);
    },
    update: async (sections: AboutContent[]) => {
      await delay(DELAY_MS);
      saveToStorage("about", sections);
    },
  },
  gallery: {
    getAll: async (): Promise<GalleryItem[]> => {
      await delay(DELAY_MS);
      return getFromStorage("gallery", initialGallery);
    },
    add: async (item: Omit<GalleryItem, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<GalleryItem[]>("gallery", initialGallery);
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("gallery", [newItem, ...current]);
      return newItem;
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<GalleryItem[]>("gallery", initialGallery);
      saveToStorage(
        "gallery",
        current.filter((x) => x.id !== id)
      );
    },
  },
  testimonials: {
    getAll: async (): Promise<Testimonial[]> => {
      await delay(DELAY_MS);
      return getFromStorage("testimonials", initialTestimonials);
    },
    add: async (item: Omit<Testimonial, "id" | "status" | "dateSubmitted">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Testimonial[]>(
        "testimonials",
        initialTestimonials
      );
      const newItem: Testimonial = {
        ...item,
        id: Date.now().toString(),
        status: "Pending",
        dateSubmitted: new Date().toISOString(),
      };
      saveToStorage("testimonials", [newItem, ...current]);
      return newItem;
    },
    updateStatus: async (id: string, status: "Approved" | "Rejected") => {
      await delay(DELAY_MS);
      const current = getFromStorage<Testimonial[]>(
        "testimonials",
        initialTestimonials
      );
      const index = current.findIndex((t) => t.id === id);
      if (index !== -1) {
        current[index].status = status;
        saveToStorage("testimonials", current);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Testimonial[]>(
        "testimonials",
        initialTestimonials
      );
      saveToStorage(
        "testimonials",
        current.filter((x) => x.id !== id)
      );
    },
  },
  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
      await delay(DELAY_MS);
      return getFromStorage("messages", initialMessages);
    },
    add: async (item: Omit<ContactMessage, "id" | "dateSent" | "status">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<ContactMessage[]>(
        "messages",
        initialMessages
      );
      const newItem: ContactMessage = {
        ...item,
        id: Date.now().toString(),
        dateSent: new Date().toISOString(),
        status: "New",
      };
      saveToStorage("messages", [newItem, ...current]);
      return newItem;
    },
    markAsRead: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<ContactMessage[]>(
        "messages",
        initialMessages
      );
      const index = current.findIndex((m) => m.id === id);
      if (index !== -1) {
        current[index].status = "Read";
        saveToStorage("messages", current);
      }
    },
  },
  officers: {
    getAll: async (): Promise<Officer[]> => {
      await delay(DELAY_MS);
      return getFromStorage("officers", initialOfficers);
    },
    add: async (item: Omit<Officer, "id">) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Officer[]>("officers", initialOfficers);
      const newItem = { ...item, id: Date.now().toString() };
      saveToStorage("officers", [newItem, ...current]);
      return newItem;
    },
    update: async (item: Officer) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Officer[]>("officers", initialOfficers);
      const index = current.findIndex((o) => o.id === item.id);
      if (index !== -1) {
        current[index] = item;
        saveToStorage("officers", current);
      }
    },
    delete: async (id: string) => {
      await delay(DELAY_MS);
      const current = getFromStorage<Officer[]>("officers", initialOfficers);
      saveToStorage(
        "officers",
        current.filter((x) => x.id !== id)
      );
    },
  },
  auth: {
    signIn: async (email: string, password?: string): Promise<User> => {
      await delay(800);

      if (!password) {
        throw new Error("Password is required.");
      }

      // Admin quick credentials
      if (
        email.toLowerCase() === "admin@orgconnect.com" &&
        password === "admin123"
      ) {
        return {
          id: "admin_1",
          email,
          name: "System Administrator",
          role: "admin",
          organizationId: undefined,
        };
      }

      // Try to find an organization with the given contact email
      const orgs = getFromStorage<Organization[]>("organizations", initialOrgs);
      const matchingOrg = orgs.find(
        (o) => o.contactEmail.toLowerCase() === email.toLowerCase()
      );

      if (matchingOrg) {
        if (matchingOrg.password && password !== matchingOrg.password) {
          throw new Error("Invalid password.");
        }

        return {
          id: `pres_${matchingOrg.id}`,
          email: matchingOrg.contactEmail,
          name: matchingOrg.presidentName,
          role: "president",
          organizationId: matchingOrg.id,
        };
      }

      throw new Error("User not found. Please check your credentials.");
    },
    signUp: async (
      email: string,
      password: string,
      role: string = "member",
      fullName?: string,
      organizationId?: string
    ): Promise<User> => {
      await delay(600);

      if (!password) throw new Error("Password is required.");

      const users = getFromStorage<any[]>("mock_users", []);
      const exists = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) throw new Error("User already exists.");

      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        role,
        fullName,
        organizationId,
      };
      saveToStorage("mock_users", [newUser, ...users]);

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.fullName || newUser.email,
        role: newUser.role as any,
        organizationId: newUser.organizationId,
      };
    },
  },
};
