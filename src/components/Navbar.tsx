import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  Maximize2,
  ChevronDown,
  User2,
  InfoIcon,
  LogInIcon,
  ArrowUpCircle,
  UserPlus,
  CogIcon,
  LogOutIcon,
  CreditCard,
  Mail,
  Book,
  Clock,
} from "lucide-react";
import { dict } from "@/utils/dict";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { calculateRemainingTime } from "@/utils/helper";

const SettingsModal = lazy(() => import("@/components/SettingsModal"));
const FeaturesModal = lazy(() => import("@/components/FeaturesModal"));

const Navbar: React.FC<{
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSettingsModal: (isSettingModalOpen: boolean) => void;
  onToggleFullScreen: (isFullScreen: boolean) => void;
  onFreeTrialClick: () => void;
}> = ({
  onUpload,
  onToggleSettingsModal,
  onToggleFullScreen,
  onFreeTrialClick,
}) => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const language = "en";
  const text = dict[language];
  const { user, signOut } = useAuth();
  const isAuth = user?.email?.trim() !== "";
  const { plan, isFreeTrial, freeTrialEndDate } = usePlan();
  const isPremium = plan === "premium";

  const remainingTime = isFreeTrial
    ? calculateRemainingTime(freeTrialEndDate!)
    : 0;

  const checkFullscreen = () => {
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      onToggleFullScreen(true);
    } else {
      setIsFullscreen(false);
      onToggleFullScreen(false);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      onToggleFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        onToggleFullScreen(false);
      }
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
  };

  const handleLogout = () => {
    signOut();
    //window.location.reload();
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <nav
        className={`${
          isFullscreen ? "hidden" : "flex"
        } items-center justify-between px-6 py-4 z-50 bg-dark-background text-dark-foreground shadow-md`}
      >
        <div className="flex flex-row items-center space-x-2">
          <img src="/images/logo.png" alt="Logo" className="h-6 w-5" />
          <div className="text-xl font-bold font-dancing">
            <span className="text-dark-secondary">AI</span>
            <span className="text-white">Read</span>
          </div>
        </div>

        <div className="flex items-center space-x-6" onClick={handleIconClick}>
          <div className="flex flex-row items-center font-dancing cursor-pointer hover:text-dark-secondary transition duration-300">
            <label
              htmlFor="file-upload"
              className="flex items-center cursor-pointer"
            >
              <Book />
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={onUpload}
              />
            </label>
          </div>
          <button
            onClick={() => {
              setIsMenuOpen(true);
            }}
            aria-label="User"
            className="hover:text-dark-secondary transition duration-300"
          >
            <User2 size={24} />
          </button>

          <button
            onClick={handleFullscreen}
            aria-label="Fullscreen"
            className="hover:text-dark-secondary transition duration-300"
          >
            <Maximize2 size={24} />
          </button>
        </div>

        {isMenuOpen && (
          <div
            className="overflow-y-auto mt-2 z-[100] absolute top-[3.2rem] right-0 w-[12rem] bg-dark-background border border-gray-600 rounded-lg shadow-lg flex flex-col p-1.5 space-y-2"
            ref={dropdownRef}
          >
            {isAuth && (
              <div>
                <div className="flex items-center px-2 py-1.5 w-full cursor-auto text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <hr className="w-full border-b border-gray-400 my-1" />
              </div>
            )}

            {[
              {
                name: "Features",
                icon: InfoIcon,
                onClick: () => {
                  setIsFeaturesModalOpen(true);
                  setIsMenuOpen(false);
                },
              },
              {
                name: "Settings",
                icon: CogIcon,
                onClick: () => {
                  setIsSettingModalOpen(true);
                  setIsMenuOpen(false);
                },
              },
              {
                name: isPremium ? "Manage Subscription" : "Upgrade",
                icon: isPremium ? CreditCard : ArrowUpCircle,
                onClick: () => {
                  if (!isAuth) {
                    router.push("/login?redirect=/payment");
                  } else {
                    if (isPremium) {
                      router.push("/subscription");
                    } else {
                      router.push("/payment/premium");
                    }
                  }
                  setIsMenuOpen(false);
                },
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center px-2 py-1.5 w-full cursor-pointer text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300"
                onClick={item.onClick}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </div>
            ))}

            {isFreeTrial && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  onFreeTrialClick();
                  setIsMenuOpen(false);
                }}
              >
                <hr className="w-full border-t border-gray-300 my-1" />
                <div className="flex items-center px-2 py-1.5 w-full text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    Free Trial: {remainingTime} left
                  </span>
                </div>
              </div>
            )}
            <hr className="w-full border-t border-gray-300 my-1" />
            {!isAuth ? (
              <>
                <Link
                  href="/login"
                  className="flex items-center px-2 py-1.5 w-full text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogInIcon className="mr-2 h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center px-2 py-1.5 w-full text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Signup
                </Link>
              </>
            ) : (
              <div
                className="flex items-center px-2 py-1.5 w-full cursor-pointer text-sm font-medium font-satisfy text-light-text dark:text-dark-text hover:bg-dark-secondary transition-colors duration-300"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Logout
              </div>
            )}
          </div>
        )}

        <Suspense fallback={null}>
          <SettingsModal
            user={user}
            isOpen={isSettingModalOpen}
            onClose={() => {
              setIsSettingModalOpen(false);
              onToggleSettingsModal(false);
            }}
          />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturesModal
            user={user}
            isOpen={isFeaturesModalOpen}
            onClose={() => {
              setIsFeaturesModalOpen(false);
            }}
          />
        </Suspense>
      </nav>

      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="fixed bottom-4 right-4 bg-dark-background text-dark-foreground p-2 rounded-full shadow-md hover:text-dark-secondary transition duration-300"
          aria-label="Exit Fullscreen"
        >
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  );
};

export default Navbar;
