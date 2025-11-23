// supabaseDb.ts
import { supabase } from "../lib/supabaseClient";
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

// --- UTILITIES FOR CASE CONVERSION ---

// Convert DB snake_case to Frontend camelCase (and IDs to strings)
const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

      // Special handling: Convert numeric/BigInt IDs to string for Frontend
      let value = obj[key];
      if (key === "id" || key.endsWith("_id")) {
        value = value ? String(value) : value;
      }

      return {
        ...result,
        [camelKey]: toCamel(value),
      };
    }, {} as any);
  }
  return obj;
};

// Convert Frontend camelCase to DB snake_case (and remove IDs for inserts)
const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );

      // Exclude 'id' from inserts if it is an empty string or undefined (Let DB auto-generate)
      if (key === "id" && !obj[key]) return result;

      return {
        ...result,
        [snakeKey]: obj[key],
      };
    }, {} as any);
  }
  return obj;
};

// Helper to handle response and apply conversion
const handleSupabaseResponse = <T>(
  data: any | null,
  error: any | null,
  tableName: string
): T => {
  if (error) {
    console.error(`Supabase Error [${tableName}]:`, error);
    throw new Error(
      error.message || `Failed to perform database operation on ${tableName}.`
    );
  }

  // Convert the data from DB format (snake_case) to App format (camelCase)
  const formattedData = toCamel(data);

  if (Array.isArray(formattedData) || formattedData === null) {
    return (formattedData || []) as T;
  }
  return formattedData as T;
};

export const supabaseDb = {
  // --- CAROUSEL ---
  carousel: {
    getAll: async (): Promise<CarouselItem[]> => {
      const { data, error } = await supabase
        .from("carousel")
        .select("*")
        .order("order", { ascending: true });
      return handleSupabaseResponse(data, error, "carousel");
    },
    update: async (items: CarouselItem[]) => {
      // Convert items to snake_case before sending
      const dbItems = toSnake(items);
      const { data, error } = await supabase
        .from("carousel")
        .upsert(dbItems, { onConflict: "id" })
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
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "announcements");
    },
    update: async (item: Announcement) => {
      const { error } = await supabase
        .from("announcements")
        .update(toSnake(item))
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
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("date", { ascending: true });
      return handleSupabaseResponse(data, error, "programs");
    },
    add: async (item: Omit<Program, "id">): Promise<Program> => {
      const { data, error } = await supabase
        .from("programs")
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "programs");
    },
    update: async (item: Program) => {
      const { error } = await supabase
        .from("programs")
        .update(toSnake(item))
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
        .order("registered_at", { ascending: false }); // Note: DB column is registered_at
      return handleSupabaseResponse(data, error, "registrations");
    },
    getByProgramId: async (programId: string): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("program_id", programId) // Note: DB column is program_id
        .order("registered_at", { ascending: false });
      return handleSupabaseResponse(data, error, "registrations");
    },
    add: async (
      item: Omit<Registration, "id" | "registeredAt" | "status">
    ): Promise<Registration> => {
      // Convert payload to snake_case
      const payload = toSnake({
        ...item,
        status: "Pending",
      });

      const { data, error } = await supabase
        .from("registrations")
        .insert(payload)
        .select()
        .single();

      if (error && error.code === "23505") {
        throw new Error("This email is already registered for this program.");
      }

      return handleSupabaseResponse(data, error, "registrations");
    },
    update: async (item: Registration) => {
      const { error } = await supabase
        .from("registrations")
        .update(toSnake(item))
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
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "presidents");
    },
    update: async (item: President) => {
      const { error } = await supabase
        .from("presidents")
        .update(toSnake(item))
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
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "organizations");
    },
    update: async (org: Organization) => {
      const { error } = await supabase
        .from("organizations")
        .update(toSnake(org))
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
        .from("about") // UPDATED TABLE NAME
        .select("*")
        .order("order", { ascending: true });
      return handleSupabaseResponse(data, error, "about");
    },
    update: async (sections: AboutContent[]) => {
      const { error } = await supabase
        .from("about")
        .upsert(toSnake(sections), { onConflict: "id" });
      handleSupabaseResponse(null, error, "about");
    },
  },

  // --- GALLERY ---
  gallery: {
    getAll: async (): Promise<GalleryItem[]> => {
      const { data, error } = await supabase
        .from("gallery") // UPDATED TABLE NAME
        .select("*")
        .order("date_uploaded", { ascending: false }); // DB column is date_uploaded
      return handleSupabaseResponse(data, error, "gallery");
    },
    add: async (item: Omit<GalleryItem, "id">): Promise<GalleryItem> => {
      const { data, error } = await supabase
        .from("gallery")
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "gallery");
    },
    delete: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      handleSupabaseResponse(null, error, "gallery");
    },
  },

  // --- TESTIMONIALS ---
  testimonials: {
    getAll: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("date_submitted", { ascending: false }); // DB column is date_submitted
      return handleSupabaseResponse(data, error, "testimonials");
    },
    add: async (
      item: Omit<Testimonial, "id" | "status" | "dateSubmitted">
    ): Promise<Testimonial> => {
      const payload = toSnake({
        ...item,
        status: "Pending",
      });
      const { data, error } = await supabase
        .from("testimonials")
        .insert(payload)
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

  // --- CONTACT MESSAGES (This fixes your error) ---
  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
      const { data, error } = await supabase
        .from("contact_messages") // UPDATED TABLE NAME
        .select("*")
        .order("date_sent", { ascending: false });
      return handleSupabaseResponse(data, error, "contact_messages");
    },
    add: async (
      item: Omit<ContactMessage, "id" | "dateSent" | "status">
    ): Promise<ContactMessage> => {
      // This will map keys: { name, email, subject, message } -> { name, email, subject, message }
      // And handle default status
      const payload = toSnake({
        ...item,
        status: "New",
      });

      const { data, error } = await supabase
        .from("contact_messages")
        .insert(payload)
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
        .insert(toSnake(item))
        .select()
        .single();
      return handleSupabaseResponse(data, error, "officers");
    },
    update: async (item: Officer) => {
      const { error } = await supabase
        .from("officers")
        .update(toSnake(item))
        .eq("id", item.id);
      handleSupabaseResponse(null, error, "officers");
    },
    delete: async (id: string) => {
      const { error } = await supabase.from("officers").delete().eq("id", id);
      handleSupabaseResponse(null, error, "officers");
    },
  },

  // --- AUTHENTICATION ---
  auth: {
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

      // This metadata must be set in Supabase Auth to work
      const userRole = data.user.app_metadata.user_role || "member";
      const organizationId = data.user.user_metadata.organization_id;

      if (userRole !== role) {
        // Optional: Sign out immediately if role doesn't match
        await supabase.auth.signOut();
        throw new Error(
          `User role mismatch. Expected ${role}, got ${userRole}`
        );
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
