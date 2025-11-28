import { IFeedback } from './feedback.model';
interface FeedbackInput {
    message: string;
    rating?: number;
    category?: string;
}
export declare const createFeedback: (userId: string | undefined, { message, rating, category }: FeedbackInput) => Promise<IFeedback>;
export declare const getRecentFeedback: (limit?: number) => Promise<IFeedback[]>;
export {};
//# sourceMappingURL=feedback.service.d.ts.map