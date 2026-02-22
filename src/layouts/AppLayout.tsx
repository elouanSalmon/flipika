import { Outlet } from "react-router-dom";
import Sidebar from "../components/app/Sidebar";
import CrmModeBanner from "../components/app/CrmModeBanner";
import "../components/app/Connected.css";
import Footer from "../components/Footer";

import { TutorialWidget } from "../components/tutorial/TutorialWidget";

import { useCrmMode } from "../contexts/CrmModeContext";

const AppLayout = () => {
  const { isCrmMode } = useCrmMode();
  const bannerHeight = isCrmMode ? "40px" : "0px";

  return (
    <div
      className="min-h-dvh flex bg-[var(--color-bg-secondary)]"
      style={{ "--crm-banner-height": bannerHeight } as React.CSSProperties}
    >
      <Sidebar />

      {/* Main content area — pushed right by sidebar */}
      <div className="app-layout-main">
        <CrmModeBanner />

        <main className="flex-1 flex flex-col">
          {/* Content Wrapper - ensures min-height and spacing */}
          <div className="app-content-wrapper">
            <div className="content-container">
              <TutorialWidget />
              <Outlet />
            </div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

