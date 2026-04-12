"use client";

import React, { lazy, Suspense, useState, useMemo } from "react";
import Reader from "@/components/Reader";
import Landing from "@/components/Landing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "../components/ui/LoadingPage";
import { useBookManager } from "@/hooks/useBookManager";
import { usePlan } from "@/context/PlanContext";
import { useVisitor } from "@/context/VisitorContext";
import { UserApi } from "@/apis/userApi";
import { useUserSync } from "@/hooks/useUserSync";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAppInitialization } from "@/hooks/useAppInitialization";

const FreeTrialModal = lazy(() => import("../components/FreeTrialModal"));
const BookList = lazy(() => import("../components/BookList"));

const Page: React.FC = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { user } = useAuth();
  const userApi = useMemo(() => new UserApi(), []);
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

  // Refactored Hooks
  useAppInitialization({ initializeVisitor, initPlan, visitor });
  useUserSync({ user, visitor, userApi });

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

  const { handleFileChange } = useFileUpload({ addBook });

  const currentBook = books.find((book) => book.id === currentBookId);

  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      <Navbar
        onUpload={handleFileChange}
        onToggleSettingsModal={setIsSettingsModalOpen}
        onToggleFullScreen={setIsFullScreen}
        onFreeTrialClick={() => setIsFreeTrialModalOpen(true)}
      />
      <div
        className={`flex flex-col items-center z-0 ${!pdfFileUrl ? "" : ""}`}
      >
        {!pdfFileUrl ? (
          <Landing onFileChange={handleFileChange} />
        ) : (
          currentBook && (
            <Reader
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
