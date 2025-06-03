"use client";

import React, { lazy, Suspense, useState, useEffect } from "react";
import Main from "./Main";
import Landing from "@/components/Landing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "../components/ui/LoadingPage";
import { useBookManager } from "@/hooks/useBookManager";
import { usePlan } from "@/context/PlanContext";
import { useVisitor } from "@/context/VisitorContext";
import { UserApi } from "@/apis/userApi";

const FreeTrialModal = lazy(() => import("../components/FreeTrialModal"));
const BookList = lazy(() => import("../components/BookList"));

const Page: React.FC = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { user } = useAuth();
  const userApi = new UserApi();
  const { visitor, initializeVisitor } = useVisitor();
  const {
    init: initPlan,
    plan,
    isFreeTrial,
    isFreeTrialActive,
    isFreeTrialModalOpen,
    setIsFreeTrialModalOpen,
    freeTrialEndDate,
  } = usePlan();

  const isPremium = plan === "premium" || plan === "pro" || isFreeTrial;
  const bookLimit = isPremium ? 100 : 10;

  // Initialize visitor on mount
  useEffect(() => {
    initializeVisitor();
  }, [initializeVisitor]);

  // Initialize plan when visitor is available
  useEffect(() => {
    if (visitor) {
      initPlan(visitor);
    }
  }, [visitor, initPlan]);

  // Sync user's free trial period with visitor's
  useEffect(() => {
    const updateUser = async () => {
      if (user && user?.email?.trim() !== "" && visitor) {
        // Normalize both dates to UTC
        const userDateUTC = new Date(user.freeTrialStartDate).toISOString();
        const visitorDateUTC = new Date(visitor.freeTrialStartDate).toISOString();

        // Compare the normalized UTC dates
        if (userDateUTC !== visitorDateUTC) {
          // Add 1 hour offset to have a correct comparison later
          const adjustedVisitorDate = new Date(visitor.freeTrialStartDate);
          adjustedVisitorDate.setHours(adjustedVisitorDate.getHours() + 1);
          try {
            await userApi.updateUser(user.email, {
              freeTrialStartDate: adjustedVisitorDate,
            });
          } catch (error) {
            console.error('Failed to update user free trial date:', error);
          }
        }
      }
    };
    updateUser();
  }, [user, visitor, userApi]);

  const {
    books,
    currentBookId,
    currentFileUrl: pdfFileUrl,
    addBook,
    updateLastPage,
    deleteBook,
    updateBookAccess,
  } = useBookManager({
    bookLimit,
    onBookLimitExceeded: () => {
      if (!isPremium) {
        setIsFreeTrialModalOpen(true);
      }
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        await addBook(file.name, fileUrl);
      };

      reader.onerror = () => {
        console.error("FileReader encountered an error.");
      };

      reader.readAsDataURL(file);
    }
  };

  const currentBook = books.find((book) => book.id === currentBookId);

  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      <Navbar
        onUpload={handleFileChange}
        onToggleSettingsModal={setIsSettingsModalOpen}
        onToggleFullScreen={setIsFullScreen}
        onFreeTrialClick={() => setIsFreeTrialModalOpen(true)}
      />
      <div className={`flex flex-col items-center z-0 ${!pdfFileUrl ? "" : ""}`}>
        {!pdfFileUrl ? (
          <Landing onFileChange={handleFileChange} />
        ) : (
          currentBook && (
            <Main
              key={currentBookId}
              book={currentBook}
              onLastPageChange={(lastPage: number) => {
                updateLastPage(currentBook.id, lastPage);
              }}
              isSettingsModalOpen={isSettingsModalOpen}
              isFullScreen={isFullScreen}
            />
          )
        )}
        {!isFullScreen && books.length > 0 && (
          <Suspense fallback={<LoadingPage />}>
            <BookList
              books={books}
              currentBookId={currentBookId}
              onBookSelect={async (book) => {
                await updateBookAccess(book.id);
              }}
              onBookDelete={deleteBook}
            />
          </Suspense>
        )}
      </div>
      <Suspense fallback={<LoadingPage />}>
        <FreeTrialModal
          user={user}
          isOpen={isFreeTrialModalOpen}
          onClose={() => setIsFreeTrialModalOpen(false)}
          isTrialActive={isFreeTrialActive}
          trialEndDate={freeTrialEndDate!}
        />
      </Suspense>

      {!currentBook && <Footer />}
    </div>
  );
};

export default Page;
