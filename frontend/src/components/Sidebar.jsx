import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, MenuIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="btn btn-ghost btn-sm p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <XIcon className="size-6" />
          ) : (
            <MenuIcon className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          w-80 lg:w-64 bg-base-200 border-r border-base-300 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ChatFluent
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/" ? "btn-active" : ""
            }`}
          >
            <HomeIcon className="size-5 text-base-content opacity-70" />
            <span>Home</span>
          </Link>

          <Link
            to="/friends"
            onClick={closeMobileMenu}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
          >
            <UsersIcon className="size-5 text-base-content opacity-70" />
            <span>Friends</span>
          </Link>

          <Link
            to="/notifications"
            onClick={closeMobileMenu}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
          >
            <BellIcon className="size-5 text-base-content opacity-70" />
            <span>Notifications</span>
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className={`text-xs flex items-center gap-1 ${isOnline ? "text-success" : "text-base-content/50"}`}>
                <span className={`size-2 rounded-full inline-block ${isOnline ? "bg-success" : "bg-base-content/50"}`} />
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
