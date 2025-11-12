/**
 * Footer Component
 *
 * Displays attribution and legal information.
 * Includes required Logo.dev attribution for free tier compliance.
 */

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NUDG3 AI. All rights reserved.</p>
        <a href="https://logo.dev" target="_blank" rel="noopener" className="hover:text-foreground transition-colors underline underline-offset-4">
          Logos provided by Logo.dev
        </a>
      </div>
    </footer>
  );
}
