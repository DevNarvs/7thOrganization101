import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle Preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Setup Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. Receive data from React
    const { email, password, firstName, lastName, phone, status } =
      await req.json();

    // 3. Create the Login Credential (Securely stored in Supabase Auth)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (authError) throw authError;

    // 4. Create the Public Profile (Saved to your table WITHOUT the password)
    const { error: profileError } = await supabaseAdmin
      .from("presidents")
      .insert([
        {
          user_id: authData.user.id, // Links this row to the Auth User
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          status: status || "Active",
          isAdmin: false,
        },
      ]);

    // If profile creation failed, delete the auth user to keep data clean
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    return new Response(
      JSON.stringify({
        user: authData.user,
        message: "Account created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
