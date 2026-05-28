import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function BankingLayout({ children }) {
  return (
    <div className="banking-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
