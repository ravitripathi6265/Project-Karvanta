import React, { useState } from 'react';
import { I18nProvider } from './i18n/i18nContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Components
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { Footer } from './components/common/Footer';
import { LanguageSelectorModal } from './components/common/LanguageSelectorModal';

// Modals
import { ContractorProfileModal } from './components/profiles/ContractorProfileModal';
import { WorkerProfileModal } from './components/profiles/WorkerProfileModal';
import { RequestQuoteModal } from './components/profiles/RequestQuoteModal';
import { ReviewModal } from './components/profiles/ReviewModal';
import { PostJobModal } from './components/jobs/PostJobModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ContractorsPage } from './pages/ContractorsPage';
import { WorkersPage } from './pages/WorkersPage';
import { LabourMarketplacePage } from './pages/LabourMarketplacePage';
import { PostWorkPage } from './pages/PostWorkPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');

  // Selected Profile for Modals
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Quote Request Modal Target
  const [quoteContractor, setQuoteContractor] = useState(null);

  // Review Modal State: { targetType, targetId, targetName }
  const [reviewTarget, setReviewTarget] = useState(null);

  // Post Job Modal State
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  // Handlers
  const handleViewContractor = (contractor) => {
    setSelectedContractor(contractor);
  };

  const handleRequestQuote = (contractor) => {
    setQuoteContractor(contractor);
  };

  const handleViewWorker = (worker) => {
    setSelectedWorker(worker);
  };

  const handleHireWorker = (worker) => {
    // Open worker modal or prompt call/whatsapp
    setSelectedWorker(worker);
  };

  const handleOpenReview = (targetType, targetId, targetName) => {
    setReviewTarget({ targetType, targetId, targetName });
  };

  return (
    <>
      {/* First-visit Language Selector Modal */}
      <LanguageSelectorModal />

      {/* Main Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Page Content */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onViewContractor={handleViewContractor}
            onRequestQuote={handleRequestQuote}
            onViewWorker={handleViewWorker}
            onHireWorker={handleHireWorker}
            onOpenPostJob={() => setIsPostJobOpen(true)}
          />
        )}

        {activeTab === 'contractors' && (
          <ContractorsPage
            onViewContractor={handleViewContractor}
            onRequestQuote={handleRequestQuote}
          />
        )}

        {activeTab === 'workers' && (
          <WorkersPage
            onViewWorker={handleViewWorker}
            onHireWorker={handleHireWorker}
          />
        )}

        {activeTab === 'labourMarketplace' && (
          <LabourMarketplacePage
            onOpenPostJob={() => setIsPostJobOpen(true)}
          />
        )}

        {activeTab === 'postWork' && (
          <PostWorkPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Responsive Mobile Bottom Nav */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Interactive Global Modals */}
      <ContractorProfileModal
        contractor={selectedContractor}
        isOpen={!!selectedContractor}
        onClose={() => setSelectedContractor(null)}
        onRequestQuote={handleRequestQuote}
        onOpenReview={handleOpenReview}
      />

      <WorkerProfileModal
        worker={selectedWorker}
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onHireWorker={handleHireWorker}
        onOpenReview={handleOpenReview}
      />

      <RequestQuoteModal
        contractor={quoteContractor}
        isOpen={!!quoteContractor}
        onClose={() => setQuoteContractor(null)}
      />

      <ReviewModal
        targetType={reviewTarget?.targetType}
        targetId={reviewTarget?.targetId}
        targetName={reviewTarget?.targetName}
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
      />

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={() => setActiveTab('labourMarketplace')}
      />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
