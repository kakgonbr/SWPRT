export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-20 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} VroomVroom.vn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
