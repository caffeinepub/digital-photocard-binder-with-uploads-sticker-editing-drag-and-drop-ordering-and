/**
 * Since we're using browser print API, this module provides instructions
 * for sharing the generated PDF.
 */
export async function shareOrDownloadPdf(
  binderName: string,
  pageNumber: number
): Promise<void> {
  // The print dialog handles the save/share functionality
  // Users can save as PDF or share from their OS print dialog
  console.log(`PDF export initiated for ${binderName} - Page ${pageNumber}`);
}

/**
 * Generates a deterministic, user-friendly filename suggestion.
 */
export function generateFilename(binderName: string, pageNumber: number): string {
  const sanitized = binderName
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  return `${sanitized}-page-${pageNumber}.pdf`;
}
