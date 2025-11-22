import React, { useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import Directory from "./pages/Directory";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import Officers from "./pages/Officers";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { Menu, X, LogOut, User } from "lucide-react";

// Navigation Component
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";
  const mobileLink = "block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                O
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800">
                OrgConnect
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
            <Link to="/programs" className={isActive("/programs")}>
              Programs
            </Link>
            <Link to="/directory" className={isActive("/directory")}>
              Directory
            </Link>
            <Link to="/gallery" className={isActive("/gallery")}>
              Showcase
            </Link>
            <Link to="/testimonials" className={isActive("/testimonials")}>
              Stories
            </Link>
            <Link to="/officers" className={isActive("/officers")}>
              Leadership
            </Link>
            <Link to="/contact" className={isActive("/contact")}>
              Contact
            </Link>

            {user ? (
              <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-200">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <User size={18} />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t py-2 px-2 space-y-1 shadow-lg">
          <Link to="/" className={mobileLink} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link
            to="/programs"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Programs
          </Link>
          <Link
            to="/directory"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Directory
          </Link>
          <Link
            to="/gallery"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Showcase
          </Link>
          <Link
            to="/testimonials"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Stories
          </Link>
          <Link
            to="/officers"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Leadership
          </Link>
          <Link
            to="/contact"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/about"
            className={mobileLink}
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          {user ? (
            <>
              <Link
                to="/admin"
                className={mobileLink}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/officers" element={<Officers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-gray-300 py-8 text-center no-print">
            <p>
              &copy; {new Date().getFullYear()} Organization Connect. All rights
              reserved.
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Designed for Youth Organizations.
            </p>
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
