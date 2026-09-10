import { IReview, IUser } from "../../types";
import { db } from "../models/db";

export interface ReviewResponse {
  success: boolean;
  reviews?: IReview[];
  review?: IReview;
  message?: string;
}

export class ReviewController {
  static getListingReviews(listingId: string): ReviewResponse {
    const reviews = db.getReviewsByListing(listingId);
    return { success: true, reviews };
  }

  static createReview(
    data: { listingId: string; rating: number; comment: string },
    currentUser: IUser
  ): ReviewResponse {
    if (!currentUser) {
      return { success: false, message: "Please log in to submit a review." };
    }

    if (!data.comment || !data.rating) {
      return { success: false, message: "Review comment and star rating are required." };
    }

    const newReview: IReview = {
      _id: `rev_${Date.now()}`,
      listingId: data.listingId,
      authorId: currentUser._id,
      author: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        location: "Verified Traveler",
      },
      rating: Math.max(1, Math.min(5, data.rating)),
      comment: data.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    db.saveReview(newReview);
    return { success: true, review: newReview, message: "Review published!" };
  }
}
