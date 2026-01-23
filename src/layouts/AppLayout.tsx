import { Outlet } from "react-router-dom";
import ConnectedHeader from "../components/app/ConnectedHeader";
import "../components/Header.css"; // Use header styles
import "../components/app/Connected.css"; // We might need to adjust or remove this if it enforced sidebar layout
import Footer from "../components/Footer";

import { TutorialWidget } from "../components/tutorial/TutorialWidget";

const AppLayout = () => {
  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg-secondary)]">
      <ConnectedHeader />

      {/* Main Content */}
      <main className="flex-1 flex flex-col" style={{ paddingTop: '80px' }}>
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
  );
};

export default AppLayout;
