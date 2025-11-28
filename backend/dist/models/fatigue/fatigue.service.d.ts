import { IFatigueRecord } from './fatigue.model';
interface RecordFatigueInput {
    status: string;
    confidence?: number;
    metrics?: Record<string, unknown>;
    capturedAt?: string | number | Date;
}
export declare const recordFatigueEvent: (userId: string, { status, confidence, metrics, capturedAt }: RecordFatigueInput) => Promise<IFatigueRecord>;
export declare const getFatigueHistory: (userId: string, limit?: number) => Promise<IFatigueRecord[]>;
export {};
//# sourceMappingURL=fatigue.service.d.ts.map