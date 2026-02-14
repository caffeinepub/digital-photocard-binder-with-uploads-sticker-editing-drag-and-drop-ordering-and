/**
 * Subscription configuration for Shopify upgrade URL.
 * Set VITE_SHOPIFY_UPGRADE_URL environment variable to configure the upgrade link.
 */

/**
 * Get the configured Shopify upgrade URL from environment variables.
 * @returns The Shopify upgrade URL or null if not configured
 */
export function getShopifyUpgradeUrl(): string | null {
  const url = import.meta.env.VITE_SHOPIFY_UPGRADE_URL;
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  
  return url.trim();
}

/**
 * Check if Shopify upgrade is configured.
 */
export function isShopifyUpgradeConfigured(): boolean {
  return getShopifyUpgradeUrl() !== null;
}
