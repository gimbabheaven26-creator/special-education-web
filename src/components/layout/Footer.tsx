export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          특수교사가 만든 학습 사이트
        </p>
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} 특수교육 공부방. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
