import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BinderView {
    id: string;
    theme: BinderTheme;
    created: Time;
    cards: Array<Photocard>;
    name: string;
}
export interface CardPosition {
    page: bigint;
    slot: bigint;
}
export type Time = bigint;
export interface Photocard {
    id: string;
    created: Time;
    name: string;
    quantity: bigint;
    image: ExternalBlob;
    position: CardPosition;
}
export interface BinderTheme {
    pageBackground: string;
    coverColor: string;
    coverTexture?: string;
    borderStyle: string;
    accentColor: string;
    backgroundPattern?: string;
    cardFrameStyle: string;
    textColor: string;
}
export interface UserProfile {
    displayName?: string;
    name: string;
    avatarUrl?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhotocard(binderId: string, name: string, image: ExternalBlob, position: CardPosition, quantity: bigint): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBinder(name: string, theme: BinderTheme): Promise<string>;
    deleteBinder(binderId: string): Promise<void>;
    getBinders(): Promise<Array<BinderView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderCards(binderId: string, newOrder: Array<string>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBinderTheme(binderId: string, newTheme: BinderTheme): Promise<void>;
}
