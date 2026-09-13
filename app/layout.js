
import './globals.css';
import NavBar from './components/NavBar';

export const metadata = {
  title: 'Web Scraper',
  description: 'Extract the title, headings, links and images from any static website.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-gray-950 text-white">
        <NavBar />

        {/* flex-1 pushes the footer to the bottom even on short pages */}
        <div className="flex-1 pt-10">{children}</div>

        <footer className="border-t border-gray-800 px-4 py-6">
          <p className="mx-auto max-w-3xl text-xs text-gray-600">
            Built with Next.js and Cheerio — by Hammad
          </p>
        </footer>
      </body>
    </html>
  );
}
