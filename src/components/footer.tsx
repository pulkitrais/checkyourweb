import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          100% Private • Runs in Your Browser • No Data Sent
        </p>

        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          © 2025 CheckYourWeb. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
