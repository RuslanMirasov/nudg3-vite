/**
 * Footer Component
 *
 * Displays attribution and legal information.
 * Includes required Logo.dev attribution for free tier compliance.
 */

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-8 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NUDG3 AI. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <a href="https://logo.dev" target="_blank" rel="noopener" className="hover:text-foreground transition-colors underline underline-offset-4">
            Logos provided by Logo.dev
          </a>
        </div>
      </div>
    </footer>
  );
}
