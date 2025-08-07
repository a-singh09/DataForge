/**
 * Type definitions for social account linking
 */

export interface LinkedSocials {
  twitter: boolean;
  spotify: boolean;
  tiktok: boolean;
  telegram: boolean;
}

export type SocialPlatform = keyof LinkedSocials;

export interface SocialPlatformInfo {
  key: SocialPlatform;
  name: string;
  icon: string;
}
