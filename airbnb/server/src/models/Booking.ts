import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBooking extends Document {
  listing: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  totalNights: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
}

interface BookingModel extends Model<IBooking> {
  checkAvailability(listingId: string | mongoose.Types.ObjectId, checkIn: Date, checkOut: Date): Promise<boolean>;
}

const bookingSchema = new Schema<IBooking, BookingModel>({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalNights: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "confirmed", index: true },
}, { timestamps: true });

// Compound index for high performance collision verification
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });

// Atomic overlap formula: (RequestedCheckIn < ExistingCheckOut) AND (RequestedCheckOut > ExistingCheckIn)
bookingSchema.statics.checkAvailability = async function (listingId, checkIn, checkOut) {
  const conflict = await this.findOne({
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    $and: [{ checkIn: { $lt: checkOut } }, { checkOut: { $gt: checkIn } }],
  });
  return !conflict;
};

export const Booking = mongoose.model<IBooking, BookingModel>("Booking", bookingSchema);
