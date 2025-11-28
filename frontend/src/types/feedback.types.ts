// Feedback related types
export interface Feedback {
  id: string;
  userId: string;
  message: string;
  rating?: number;
  createdAt: string;
}

export interface AddFeedbackRequest {
  message: string;
  rating?: number;
}

export interface AddFeedbackResponse {
  feedback: Feedback;
  msg: string;
}

export interface FeedbackListResponse {
  feedback: Feedback[];
  total: number;
}

export interface FeedbackListParams {
  limit?: number;
}
