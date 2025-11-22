// supabaseDb.ts
import { supabase } from "../lib/supabaseClient"; // Import the client we just created
import {
  Announcement,
  CarouselItem,
  Program,
  Organization,
  AboutContent,
  President,
  Registration,
  GalleryItem,
  Testimonial,
  ContactMessage,
  Officer,
  User,
} from "../types";

/**
 * --- REAL SUPABASE SERVICE ---
 * All mock functions are rewritten to use the actual Supabase client.
 * NOTE: Error handling is kept simple (throwing), but in a real app,
 * you should use try/catch blocks and log the 'error' object from Supabase.
 */

// A helper function to handle Supabase query errors
const handleSupabaseResponse = <T>(
  data: T | null,
  error: Error | null,
  tableName: string
): T => {
  if (error) {
    console.error(`Supabase Error [${tableName}]:`, error);
    // Throw a generic error or the Supabase error message
    throw new Error(`Failed to perform database operation on ${tableName}.`);
  }
  // Ensure we always return an array even if data is null for 'getAll' type calls
  if (Array.isArray(data) || data === null) {
    return (data || []) as T;
  }
  return data as T;
};

export const supabaseDb = {
  // --- CAROUSEL ---
  carousel: {
    getAll: async (): Promise<CarouselItem[]> => {
      const { data, error } = await supabase
        .from("carousel") // Assuming your table name is 'carousel'
        .select("*")
        .order("order", { ascending: true }); // Order by 'order' column

      return handleSupabaseResponse(data, error, "carousel");
    },
    // NOTE: Supabase typically uses an array of objects for bulk updates/upserts
    update: async (items: CarouselItem[]) => {
      const { data, error } = await supabase
        .from("carousel")
        .upsert(items, { onConflict: "id" }) // Upsert based on the 'id' field
        .select();

      handleSupabaseResponse(data, error, "carousel");
    },
  },

  // --- ANNOUNCEMENTS ---
  announcements: {
    getAll: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });

      return handleSupabaseResponse(data, error, "announcements");
    },
    add: async (item: Omit<Announcement, "id">): Promise<Announcement> => {
      const { data, error } = await supabase
        .from("announcements")
        .insert(item)
        .select() // Return the inserted item with its generated ID
        .single();

      return handleSupabaseResponse(data, error, "announcements");
    },
    update: async (item: Announcement) => {
      const { error } = await supabase
        .from("announcements")
        .update(item)
        .eq("id", item.id);

      handleSupabaseResponse(null, error, "announcements");
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      handleSupabaseResponse(null, error, "announcements");
    },
  },

  // --- PROGRAMS ---
  programs: {
    getAll: async (): Promise<Program[]> => {
      // Use .select('*, organizer:organizerId(*)') for join if you need the full organization data
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("date", { ascending: true });

      return handleSupabaseResponse(data, error, "programs");
    },
    add: async (item: Omit<Program, "id">): Promise<Program> => {
      const { data, error } = await supabase
        .from("programs")
        .insert(item)
        .select()
        .single();

      return handleSupabaseResponse(data, error, "programs");
    },
    update: async (item: Program) => {
      const { error } = await supabase
        .from("programs")
        .update(item)
        .eq("id", item.id);

      handleSupabaseResponse(null, error, "programs");
    },
    delete: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      handleSupabaseResponse(null, error, "programs");
    },
  },

  // --- REGISTRATIONS ---
  registrations: {
    getAll: async (): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("registeredAt", { ascending: false });

      return handleSupabaseResponse(data, error, "registrations");
    },
    getByProgramId: async (programId: string): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("programId", programId)
        .order("registeredAt", { ascending: false });

      return handleSupabaseResponse(data, error, "registrations");
    },
    add: async (
      item: Omit<Registration, "id" | "registeredAt" | "status">
    ): Promise<Registration> => {
      // Supabase is ideal for handling the "DUPLICATE CHECK" using a UNIQUE constraint on (program_id, participant_email)
      // If a unique constraint is set in the database, the insert will fail automatically, which you can catch.
      const registrationData = {
        ...item,
        // Supabase will automatically set 'registeredAt' if the column has a 'default now()'
        // We set a default status here, assuming the DB doesn't do it.
        status: "Pending",
      };

      const { data, error } = await supabase
        .from("registrations")
        .insert(registrationData)
        .select()
        .single();

      if (error && error.code === "23505") {
        // PostgreSQL unique violation error code
        throw new Error("This email is already registered for this program.");
      }

      return handleSupabaseResponse(data, error, "registrations");
    },
    update: async (item: Registration) => {
      const { error } = await supabase
        .from("registrations")
        .update(item)
        .eq("id", item.id);

      handleSupabaseResponse(null, error, "registrations");
    },
  },

  // --- PRESIDENTS ---
  presidents: {
    getAll: async (): Promise<President[]> => {
      const { data, error } = await supabase.from("presidents").select("*");
      return handleSupabaseResponse(data, error, "presidents");
    },
    add: async (item: Omit<President, "id">): Promise<President> => {
      const { data, error } = await supabase
        .from("presidents")
        .insert(item)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "presidents");
    },
    update: async (item: President) => {
      const { error } = await supabase
        .from("presidents")
        .update(item)
        .eq("id", item.id);
      handleSupabaseResponse(null, error, "presidents");
    },
    delete: async (id: string) => {
      const { error } = await supabase.from("presidents").delete().eq("id", id);
      handleSupabaseResponse(null, error, "presidents");
    },
  },

  // --- ORGANIZATIONS ---
  organizations: {
    getAll: async (): Promise<Organization[]> => {
      const { data, error } = await supabase.from("organizations").select("*");
      return handleSupabaseResponse(data, error, "organizations");
    },
    add: async (item: Omit<Organization, "id">): Promise<Organization> => {
      const { data, error } = await supabase
        .from("organizations")
        .insert(item)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "organizations");
    },
    update: async (org: Organization) => {
      const { error } = await supabase
        .from("organizations")
        .update(org)
        .eq("id", org.id);
      handleSupabaseResponse(null, error, "organizations");
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id);
      handleSupabaseResponse(null, error, "organizations");
    },
  },

  // --- ABOUT CONTENT ---
  about: {
    getAll: async (): Promise<AboutContent[]> => {
      const { data, error } = await supabase
        .from("about_content") // Assuming 'about_content' is your table name
        .select("*")
        .order("order", { ascending: true });
      return handleSupabaseResponse(data, error, "about_content");
    },
    // NOTE: This uses upsert to replace the entire set of sections based on 'id'
    update: async (sections: AboutContent[]) => {
      const { error } = await supabase
        .from("about_content")
        .upsert(sections, { onConflict: "id" });
      handleSupabaseResponse(null, error, "about_content");
    },
  },

  // --- GALLERY ---
  gallery: {
    getAll: async (): Promise<GalleryItem[]> => {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("dateUploaded", { ascending: false });
      return handleSupabaseResponse(data, error, "gallery_items");
    },
    add: async (item: Omit<GalleryItem, "id">): Promise<GalleryItem> => {
      const { data, error } = await supabase
        .from("gallery_items")
        .insert(item)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "gallery_items");
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("gallery_items")
        .delete()
        .eq("id", id);
      handleSupabaseResponse(null, error, "gallery_items");
    },
  },

  // --- TESTIMONIALS ---
  testimonials: {
    getAll: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("dateSubmitted", { ascending: false });
      return handleSupabaseResponse(data, error, "testimonials");
    },
    add: async (
      item: Omit<Testimonial, "id" | "status" | "dateSubmitted">
    ): Promise<Testimonial> => {
      const testimonialData = {
        ...item,
        status: "Pending",
        // dateSubmitted will ideally be set by the DB default value (now())
      };
      const { data, error } = await supabase
        .from("testimonials")
        .insert(testimonialData)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "testimonials");
    },
    updateStatus: async (id: string, status: "Approved" | "Rejected") => {
      const { error } = await supabase
        .from("testimonials")
        .update({ status: status })
        .eq("id", id);
      handleSupabaseResponse(null, error, "testimonials");
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      handleSupabaseResponse(null, error, "testimonials");
    },
  },

  // --- CONTACT MESSAGES ---
  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("dateSent", { ascending: false });
      return handleSupabaseResponse(data, error, "contact_messages");
    },
    add: async (
      item: Omit<ContactMessage, "id" | "dateSent" | "status">
    ): Promise<ContactMessage> => {
      const messageData = {
        ...item,
        status: "New",
      };
      const { data, error } = await supabase
        .from("contact_messages")
        .insert(messageData)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "contact_messages");
    },
    markAsRead: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "Read" })
        .eq("id", id);
      handleSupabaseResponse(null, error, "contact_messages");
    },
  },

  // --- OFFICERS ---
  officers: {
    getAll: async (): Promise<Officer[]> => {
      const { data, error } = await supabase
        .from("officers")
        .select("*")
        .order("order", { ascending: true });
      return handleSupabaseResponse(data, error, "officers");
    },
    add: async (item: Omit<Officer, "id">): Promise<Officer> => {
      const { data, error } = await supabase
        .from("officers")
        .insert(item)
        .select()
        .single();
      return handleSupabaseResponse(data, error, "officers");
    },
    update: async (item: Officer) => {
      const { error } = await supabase
        .from("officers")
        .update(item)
        .eq("id", item.id);
      handleSupabaseResponse(null, error, "officers");
    },
    delete: async (id: string) => {
      const { error } = await supabase.from("officers").delete().eq("id", id);
      handleSupabaseResponse(null, error, "officers");
    },
  },

  // --- AUTHENTICATION (Using Supabase Auth) ---
  auth: {
    // NOTE: This is a placeholder for a real Supabase Auth implementation.
    // Supabase handles auth via methods like signInWithPassword, not direct DB queries.
    // The previous mock logic for 'admin' and 'president' roles should be mapped to
    // Supabase's RLS and User Metadata system, not custom sign-in logic.
    signIn: async (
      email: string,
      role: string,
      password?: string
    ): Promise<User> => {
      if (!password) {
        throw new Error("Password is required.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Sign-in failed. User data missing.");
      }

      // --- Custom Role/Metadata Logic (Requires Supabase Setup) ---
      // In a real app, you'd check the user's 'app_metadata' or query a separate
      // profile table to determine if they are an 'admin' or 'president' and
      // get their organizationId.

      // Placeholder logic:
      const userRole = data.user.app_metadata.user_role || "member"; // Assuming you set this in Supabase
      const organizationId = data.user.user_metadata.organization_id;

      if (userRole !== role) {
        throw new Error("User role mismatch.");
      }

      return {
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata.full_name || "Authenticated User",
        role: userRole,
        organizationId: organizationId,
      } as User;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase Sign Out Error:", error);
        throw new Error("Failed to sign out.");
      }
    },
  },
};
