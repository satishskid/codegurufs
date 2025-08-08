import React from 'react';
import TerminalActivation from './components/TerminalActivation';
import ChatView from './components/ChatView';
import StudentLogin from './components/StudentLogin';
import Header from './components/Header';
import { useTerminal } from './hooks/useTerminal';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const App: React.FC = () => {
  const { 
    terminalId, 
    isLoading, 
    error, 
    terminalInfo, 
    studentName, 
    setStudentName, 
    logoutStudent 
  } = useTerminal();

  if (isLoading) {
    return <TerminalActivation status="loading" />;
  }

  if (error) {
    return <TerminalActivation status="error" message={error} />;
  }

  if (!terminalId || !terminalInfo) {
    // This state occurs if the app is opened without an activation link for the first time.
    return <TerminalActivation status="unactivated" />;
  }

  const renderContent = () => {
    if (!studentName) {
      return <StudentLogin onLogin={setStudentName} />;
    }
    return <ChatView studentName={studentName} />;
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-100">
      <SignedOut>
        <div className="flex items-center justify-center h-full">
          <SignInButton mode="modal"/>
        </div>
      </SignedOut>
      <SignedIn>
        <Header 
          terminalInfo={terminalInfo}
          studentName={studentName}
          onLogout={logoutStudent} 
        />
        <main className="flex-grow overflow-hidden">
          {renderContent()}
        </main>
        <div className="fixed right-4 bottom-4">
          <UserButton/>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
