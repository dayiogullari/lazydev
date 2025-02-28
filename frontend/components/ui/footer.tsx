export function Footer() {
  return (
    <footer className="border-t border-gray-700/50 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
        <div className="flex justify-center gap-4">
          <a
            href="https://docs.lazydev.zone/"
            className="hover:text-blue-400 cursor-pointer transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
          <a
            href="https://github.com/dayiogullari/lazydev"
            className="hover:text-green-400 cursor-pointer transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://x.com/lazydev_zone"
            className="hover:text-blue-400 cursor-pointer transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
