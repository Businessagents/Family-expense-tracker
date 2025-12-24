import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/src/services/api';
import { useAuth } from './AuthContext';

interface Group {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  invite_code: string | null;
  color: string;
  members: Array<{
    id: string;
    name: string;
    avatar_color: string;
  }>;
  created_by: string;
  created_at: string;
}

interface GroupContextType {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  selectGroup: (group: Group | null) => void;
  createGroup: (name: string, type?: string) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  getPersonalGroup: () => Group | null;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetchGroups();
    } else {
      setGroups([]);
      setSelectedGroup(null);
    }
  }, [token, user]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGroups();
      setGroups(data);
      
      // Auto-select personal group if no selection
      if (!selectedGroup && data.length > 0) {
        const personal = data.find((g: Group) => g.type === 'personal');
        setSelectedGroup(personal || data[0]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectGroup = (group: Group | null) => {
    setSelectedGroup(group);
  };

  const createGroup = async (name: string, type: string = 'shared'): Promise<Group> => {
    const newGroup = await api.createGroup(name, type);
    await fetchGroups();
    return newGroup;
  };

  const joinGroup = async (inviteCode: string): Promise<Group> => {
    const joinedGroup = await api.joinGroup(inviteCode);
    await fetchGroups();
    return joinedGroup;
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    await api.leaveGroup(groupId);
    if (selectedGroup?.id === groupId) {
      const personal = groups.find(g => g.type === 'personal');
      setSelectedGroup(personal || null);
    }
    await fetchGroups();
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    await api.deleteGroup(groupId);
    if (selectedGroup?.id === groupId) {
      const personal = groups.find(g => g.type === 'personal');
      setSelectedGroup(personal || null);
    }
    await fetchGroups();
  };

  const getPersonalGroup = (): Group | null => {
    return groups.find(g => g.type === 'personal') || null;
  };

  return (
    <GroupContext.Provider value={{
      groups,
      selectedGroup,
      isLoading,
      fetchGroups,
      selectGroup,
      createGroup,
      joinGroup,
      leaveGroup,
      deleteGroup,
      getPersonalGroup,
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}
