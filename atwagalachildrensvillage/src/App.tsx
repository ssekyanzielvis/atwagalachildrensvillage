import { Navigate, Route, Routes } from 'react-router-dom';

import VisitorLayout from './app/(visitor)/layout';
import HomePage from './app/(visitor)/page';
import AboutPage from './app/(visitor)/about/page';
import ProgramsPage from './app/(visitor)/programs/page';
import GalleryPage from './app/(visitor)/gallery/page';
import LeadershipPage from './app/(visitor)/leadership/page';
import ContactPage from './app/(visitor)/contact/page';
import DonatePage from './app/(visitor)/donate/page';
import VerifyPaymentPage from './app/(visitor)/donate/verify/page';
import AchievementPage from './app/(visitor)/achievements/page';
import CoreValuesPage from './app/(visitor)/core-values/page';
import NewsPage from './app/(visitor)/news/page';
import StaffPage from './app/(visitor)/staff/page';
import VolunteersPage from './app/(visitor)/volunteers/page';
import PartnersPage from './app/(visitor)/partners/page';

import ApplyStaffPage from './app/apply/staff/page';
import ApplyVolunteerPage from './app/apply/volunteer/page';
import ApplyPartnerPage from './app/apply/partner/page';
import ApplyProgramSponsorPage from './app/apply/program-sponsor/page';

import AdminLayout from './app/admin/layout';
import AdminPage from './app/admin/page';
import AdminLoginPage from './app/admin/login/page';
import AdminDashboard from './app/admin/dashboard/page';
import AdminAchievementsPage from './app/admin/achievements/page';
import AdminAnalyticsPage from './app/admin/analytics/page';
import AdminContactsPage from './app/admin/contacts/page';
import AdminContentPage from './app/admin/content/page';
import AdminCoreValuesPage from './app/admin/core-values/page';
import AdminGalleryPage from './app/admin/gallery/page';
import AdminLeadershipPage from './app/admin/leadership/page';
import AdminNewsPage from './app/admin/news/page';
import AdminOfficeHoursPage from './app/admin/office-hours/page';
import AdminPartnersPage from './app/admin/partners/page';
import AdminPaymentNumbersPage from './app/admin/payment-numbers/page';
import AdminBankDetailsPage from './app/admin/bank-details/page';
import AdminProgramsPage from './app/admin/programs/page';
import AdminProgramSponsorsPage from './app/admin/program-sponsors/page';
import AdminSettingsPage from './app/admin/settings/page';
import AdminSlidesPage from './app/admin/slides/page';
import AdminStaffPage from './app/admin/staff/page';
import AdminThemePage from './app/admin/theme/page';
import AdminUsersPage from './app/admin/users/page';
import AdminVolunteersPage from './app/admin/volunteers/page';

import Notification from './components/Notification';
import AnalyticsTracker from './components/AnalyticsTracker';

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Notification />
      <Routes>
        <Route path="/" element={<VisitorLayout><HomePage /></VisitorLayout>} />
        <Route path="/about" element={<VisitorLayout><AboutPage /></VisitorLayout>} />
        <Route path="/programs" element={<VisitorLayout><ProgramsPage /></VisitorLayout>} />
        <Route path="/gallery" element={<VisitorLayout><GalleryPage /></VisitorLayout>} />
        <Route path="/leadership" element={<VisitorLayout><LeadershipPage /></VisitorLayout>} />
        <Route path="/contact" element={<VisitorLayout><ContactPage /></VisitorLayout>} />
        <Route path="/donate" element={<VisitorLayout><DonatePage /></VisitorLayout>} />
        <Route path="/donate/verify" element={<VisitorLayout><VerifyPaymentPage /></VisitorLayout>} />
        <Route path="/achievements" element={<VisitorLayout><AchievementPage /></VisitorLayout>} />
        <Route path="/core-values" element={<VisitorLayout><CoreValuesPage /></VisitorLayout>} />
        <Route path="/news" element={<VisitorLayout><NewsPage /></VisitorLayout>} />
        <Route path="/staff" element={<VisitorLayout><StaffPage /></VisitorLayout>} />
        <Route path="/volunteers" element={<VisitorLayout><VolunteersPage /></VisitorLayout>} />
        <Route path="/partners" element={<VisitorLayout><PartnersPage /></VisitorLayout>} />

        <Route path="/apply/staff" element={<ApplyStaffPage />} />
        <Route path="/apply/volunteer" element={<ApplyVolunteerPage />} />
        <Route path="/apply/partner" element={<ApplyPartnerPage />} />
        <Route path="/apply/program-sponsor" element={<ApplyProgramSponsorPage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/slides" element={<AdminLayout><AdminSlidesPage /></AdminLayout>} />
        <Route path="/admin/content" element={<AdminLayout><AdminContentPage /></AdminLayout>} />
        <Route path="/admin/programs" element={<AdminLayout><AdminProgramsPage /></AdminLayout>} />
        <Route path="/admin/program-sponsors" element={<AdminLayout><AdminProgramSponsorsPage /></AdminLayout>} />
        <Route path="/admin/achievements" element={<AdminLayout><AdminAchievementsPage /></AdminLayout>} />
        <Route path="/admin/core-values" element={<AdminLayout><AdminCoreValuesPage /></AdminLayout>} />
        <Route path="/admin/gallery" element={<AdminLayout><AdminGalleryPage /></AdminLayout>} />
        <Route path="/admin/news" element={<AdminLayout><AdminNewsPage /></AdminLayout>} />
        <Route path="/admin/leadership" element={<AdminLayout><AdminLeadershipPage /></AdminLayout>} />
        <Route path="/admin/contacts" element={<AdminLayout><AdminContactsPage /></AdminLayout>} />
        <Route path="/admin/office-hours" element={<AdminLayout><AdminOfficeHoursPage /></AdminLayout>} />
        <Route path="/admin/donations" element={<AdminLayout><AdminContentPage /></AdminLayout>} />
        <Route path="/admin/payment-numbers" element={<AdminLayout><AdminPaymentNumbersPage /></AdminLayout>} />
        <Route path="/admin/bank-details" element={<AdminLayout><AdminBankDetailsPage /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><AdminAnalyticsPage /></AdminLayout>} />
        <Route path="/admin/theme" element={<AdminLayout><AdminThemePage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
        <Route path="/admin/staff" element={<AdminLayout><AdminStaffPage /></AdminLayout>} />
        <Route path="/admin/volunteers" element={<AdminLayout><AdminVolunteersPage /></AdminLayout>} />
        <Route path="/admin/partners" element={<AdminLayout><AdminPartnersPage /></AdminLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
