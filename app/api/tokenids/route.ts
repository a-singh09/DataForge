import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TokenId } from "@/models/TokenId";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/tokenids - Starting request processing");

    await connectToDatabase();
    console.log("Database connected successfully");

    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", body);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { tokenId } = body;
    console.log("Extracted tokenId:", tokenId);

    if (!tokenId) {
      console.log("Token ID is missing from request");
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 },
      );
    }

    // Check if token ID already exists
    console.log("Checking if token ID already exists:", tokenId.toString());
    const existingToken = await TokenId.findOne({
      tokenId: tokenId.toString(),
    });

    if (existingToken) {
      console.log("Token ID already exists:", existingToken.tokenId);
      return NextResponse.json({
        message: "Token ID already exists",
        tokenId: existingToken.tokenId,
      });
    }

    // Create new token ID record
    console.log("Creating new token ID record");
    const newTokenId = new TokenId({
      tokenId: tokenId.toString(),
    });

    await newTokenId.save();
    console.log("Token ID saved successfully:", newTokenId.tokenId);

    return NextResponse.json({
      message: "Token ID stored successfully",
      tokenId: newTokenId.tokenId,
    });
  } catch (error) {
    console.error("Error storing token ID:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to store token ID", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const tokenIds = await TokenId.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      tokenIds: tokenIds.map((token) => token.tokenId),
    });
  } catch (error) {
    console.error("Error fetching token IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch token IDs" },
      { status: 500 },
    );
  }
}
