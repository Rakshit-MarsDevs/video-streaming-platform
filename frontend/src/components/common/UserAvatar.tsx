import React from 'react';
import '../../css/components/common/UserAvatar.css';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  size = 'md',
  className = '',
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`user-avatar ${size} ${className}`}>
      {getInitials(username)}
    </div>
  );
};

export default UserAvatar; 