import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IATMReview extends Document {
  atmId: string;
  userName: string;
  rating: number;
  comment: string;
  cashAvailable: boolean;
  workingStatus: 'working' | 'not_working' | 'partially_working' | 'accepting_own_bank';
  createdAt: Date;
  updatedAt: Date;
}

const ATMReviewSchema: Schema = new Schema(
  {
    atmId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    cashAvailable: {
      type: Boolean,
      required: true,
    },
    workingStatus: {
      type: String,
      enum: ['working', 'not_working', 'partially_working', 'accepting_own_bank'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
ATMReviewSchema.index({ atmId: 1, createdAt: -1 });

// Delete cached model to ensure schema changes are applied
if (mongoose.models.ATMReview) {
  delete mongoose.models.ATMReview;
}

const ATMReview: Model<IATMReview> = mongoose.model<IATMReview>('ATMReview', ATMReviewSchema);

export default ATMReview;
