import { useState } from 'react';
import { Link } from 'wouter';
import MobileMenu from './MobileMenu';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xl font-bold shadow-md">
              <span>📱</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Social Media Calendar</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Dashboard
            </Link>
            <Link href="/calendar" className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Calendar
            </Link>
            <Link href="/reports" className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Reports
            </Link>
            <Link href="/settings" className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Settings
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
