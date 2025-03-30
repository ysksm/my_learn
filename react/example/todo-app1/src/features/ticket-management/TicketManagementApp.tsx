import React, { useState, useEffect } from 'react';
import { TicketList, TicketDetail, CreateTicketForm } from './components';
import { useDemoData } from './hooks';
import './styles.css';

enum AppView {
  LIST = 'list',
  DETAIL = 'detail',
  CREATE = 'create'
}

export const TicketManagementApp: React.FC = () => {
  const { initializing, initialized, error } = useDemoData();
  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView(AppView.DETAIL);
  };

  const handleBackToList = () => {
    setCurrentView(AppView.LIST);
    setSelectedTicketId(null);
  };

  const handleCreateTicket = () => {
    setCurrentView(AppView.CREATE);
  };

  const handleTicketCreated = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView(AppView.DETAIL);
  };

  const handleCancelCreate = () => {
    setCurrentView(AppView.LIST);
  };

  if (initializing) {
    return <div className="loading">データを初期化中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!initialized) {
    return <div className="loading">データを読み込み中...</div>;
  }

  return (
    <div className="ticket-management-app">
      <header className="app-header">
        <h1>TODOアプリケーション</h1>
        <div className="app-actions">
          {currentView !== AppView.CREATE && (
            <button onClick={handleCreateTicket}>新規チケット作成</button>
          )}
        </div>
      </header>

      <main className="app-content">
        {currentView === AppView.LIST && (
          <TicketList onTicketClick={handleTicketClick} />
        )}

        {currentView === AppView.DETAIL && selectedTicketId && (
          <TicketDetail 
            ticketId={selectedTicketId} 
            onBack={handleBackToList}
          />
        )}

        {currentView === AppView.CREATE && (
          <CreateTicketForm 
            onSuccess={handleTicketCreated}
            onCancel={handleCancelCreate}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 TODOアプリケーション</p>
      </footer>
    </div>
  );
};
