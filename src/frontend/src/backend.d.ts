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
export type Time = bigint;
export interface Photocard {
    id: string;
    created: Time;
    name: string;
    quantity: bigint;
    rarity: CardRarity;
    image: ExternalBlob;
    position: CardPosition;
    condition: CardCondition;
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
export interface CardPosition {
    page: bigint;
    slot: bigint;
}
export interface UserProfile {
    displayName?: string;
    name: string;
    avatarUrl?: string;
}
export enum CardCondition {
    played = "played",
    fair = "fair",
    good = "good",
    mint = "mint",
    none = "none",
    nearMint = "nearMint"
}
export enum CardRarity {
    ultraRare = "ultraRare",
    legendary = "legendary",
    none = "none",
    rare = "rare",
    common = "common"
}
export enum SubscriptionStatus {
    pro = "pro",
    free = "free"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhotocard(binderId: string, name: string, image: ExternalBlob, position: CardPosition, quantity: bigint, rarity: CardRarity, condition: CardCondition): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBinder(name: string, theme: BinderTheme): Promise<string>;
    deleteBinder(binderId: string): Promise<void>;
    deletePhotocard(binderId: string, cardId: string): Promise<void>;
    getBinders(): Promise<Array<BinderView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSubscriptionStatus(): Promise<SubscriptionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderCards(binderId: string, newOrder: Array<string>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBinderTheme(binderId: string, newTheme: BinderTheme): Promise<void>;
    updatePhotocard(binderId: string, cardId: string, name: string, image: ExternalBlob, position: CardPosition, quantity: bigint, rarity: CardRarity, condition: CardCondition): Promise<void>;
    updateSubscriptionStatus(user: Principal, status: SubscriptionStatus): Promise<void>;
}
