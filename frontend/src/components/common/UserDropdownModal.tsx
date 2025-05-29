import React from 'react';
import { UserIcon, LogoutIcon } from '../../assets/icons/index.tsx';
import '../../css/components/common/UserDropdownModal.css';

interface UserDropdownModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onLogout: () => void;
}

const UserDropdownModal: React.FC<UserDropdownModalProps> = ({
  username,
  isOpen,
  onClose,
  onViewProfile,
  onLogout,
}) => {
  if (!isOpen) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="user-dropdown-modal-backdrop" onClick={handleBackdropClick}>
      <div className="user-dropdown-modal">
        <div className="user-dropdown-header">
          <div className="user-avatar-large">
            {getInitials(username)}
          </div>
          <h3 className="user-dropdown-name">{username}</h3>
        </div>
        
        <div className="user-dropdown-actions">
          <button 
            className="dropdown-action-btn" 
            onClick={onViewProfile}
          >
            <UserIcon />
            <span>View Profile</span>
          </button>
          
          <button 
            className="dropdown-action-btn danger" 
            onClick={onLogout}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdownModal; 