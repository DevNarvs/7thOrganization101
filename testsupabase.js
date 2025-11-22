import dotenv from "dotenv";
dotenv.config();

import supabase from "./supabaseClient.js";

async function testDB() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("id", { ascending: true });

  if (error) console.error("DB Error:", error);
  else console.log("Messages:", data);
}

testDB();
