import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        }
      }
    });

    console.log("SUPABASE_AUTH_RESULT:", { authData, authError });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 400 });
    }

    // Sync to the custom "User" table provided by the user
    // Note: The table name is case-sensitive "User"
    const { error: dbError } = await supabase
      .from('User')
      .insert([
        { 
          id: authData.user.id,
          name: `${firstName} ${lastName}`,
          email: email,
          role: role,
          // We don't store the raw password in the User table if it's handled by Auth,
          // but the schema allows it. For security, we'll skip it or store it hashed.
          // Since it's already in Supabase Auth, storing it in the "User" table is redundant
          // but we follow the schema provided.
        }
      ]);

    if (dbError) {
      console.error("DB_SYNC_ERROR:", dbError);
      // We might not want to fail the whole registration if the Auth part succeeded,
      // but for a clean state, we should report it.
      return NextResponse.json({ 
        success: true, 
        user: authData.user,
        warning: "Auth successful, but DB sync failed",
        error: dbError.message 
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: authData.user
    });

  } catch (error: any) {
    console.error("REGISTRATION_ERROR_JSON:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
