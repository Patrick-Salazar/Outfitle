
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shirt, Plus, Heart, Sparkles, LogOut, User as UserIcon, Calendar, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from "../components/LanguageProvider";
import LanguageSelector from "../components/LanguageSelector";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useLanguage();
  const navRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      if (!location.pathname.includes("Landing")) {
        navigate(createPageUrl("Landing"));
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl("Landing"));
  };

  // Check scroll position for arrows
  const checkScroll = useCallback(() => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollNav = (direction) => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (location.pathname.includes("Landing")) {
    return children;
  }

  const navItems = [
    { name: "Wardrobe", label: t("myWardrobe"), icon: Shirt },
    { name: "StyleAssistant", label: t("styleAI"), icon: Sparkles },
    { name: "MyEvents", label: "MY EVENTS", icon: Calendar },
    { name: "Analytics", label: t("analytics"), icon: Sparkles },
    { name: "SpendingAlert", label: t("budget"), icon: Sparkles },
    { name: "DonationReminder", label: t("reminders"), icon: Sparkles },
    { name: "Community", label: t("donate"), icon: Heart },
    { name: "MyChats", label: "MESSAGES", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100">
      <style>{`
        :root {
          --gold: #C9A86A;
          --dark: #1A1A1A;
          --soft-gray: #8B8B8B;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Wardrobe")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{t("appName")}</h1>
                <p className="text-xs text-neutral-500 tracking-wide">{t("appTagline")}</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full w-10 h-10 p-0 overflow-hidden">
                    {currentUser?.profile_image_url ? (
                      <img 
                        src={currentUser.profile_image_url} 
                        alt={currentUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentUser?.full_name}</p>
                    <p className="text-xs text-neutral-500">{currentUser?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="relative mt-4">
            {/* Left Scroll Arrow */}
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollNav('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full w-8 h-8 md:w-10 md:h-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Navigation Items */}
            <nav 
              ref={navRef}
              onScroll={checkScroll}
              className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-8 md:px-0"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2 px-4 md:px-4 py-3 md:py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="text-base md:text-sm font-medium tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Scroll Arrow */}
            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollNav('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full w-8 h-8 md:w-10 md:h-10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default function Layout(props) {
  return (
    <LanguageProvider>
      <LayoutContent {...props} />
    </LanguageProvider>
  );
}
