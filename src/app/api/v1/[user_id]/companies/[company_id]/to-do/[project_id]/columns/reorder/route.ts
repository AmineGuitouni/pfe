import { NextRequest, NextResponse } from "next/server";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: { user_id: string; company_id: string; project_id: string };
  }
) {
  try {
    const { user_id, company_id, project_id } = params;
    
    // Validate params
    if (!company_id || !project_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const client = await getServerDBfromCompanyId(company_id);
    
    if (!client) {
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { columnOrder } = body;

    // Validate input
    if (!columnOrder || !Array.isArray(columnOrder)) {
      return NextResponse.json(
        { error: "Invalid column order data" },
        { status: 400 }
      );
    }

    // Validate that each item has id and order
    for (const item of columnOrder) {
      if (!item.id || typeof item.order !== "number") {
        return NextResponse.json(
          { error: "Each column order item must have id and order fields" },
          { status: 400 }
        );
      }
    }

    // Update each column's order in the database
    const updatePromises = columnOrder.map(async (item: { id: string; order: number }) => {
      const { error } = await client
        .from("columns")
        .update({ column_order: item.order }) // Using column_order field name
        .eq("id", item.id)
        .eq("project_id", project_id);

      if (error) {
        console.error(`Error updating column ${item.id}:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: "Column order updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reordering columns:", error);
    return NextResponse.json(
      { error: "Failed to reorder columns" },
      { status: 500 }
    );
  }
}