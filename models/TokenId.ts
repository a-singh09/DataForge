import mongoose from "mongoose";

export interface ITokenId {
  tokenId: string;
  createdAt: Date;
}

const TokenIdSchema = new mongoose.Schema<ITokenId>({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const TokenId =
  mongoose.models.TokenId || mongoose.model<ITokenId>("TokenId", TokenIdSchema);
