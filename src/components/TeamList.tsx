import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GroupMembersList from './GroupMembersList';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeamListProps {
  onGroupSelect: (groupId: string) => void;
}

export const TeamList: React.FC<TeamListProps> = ({ onGroupSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<{ name: string; items: string[]; id: string }[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groupChats'), (snapshot) => {
      const groupChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        items: doc.data().items || [],
      })) as { name: string; items: string[]; id: string }[];
      setTeams(groupChats);
    });

    return () => unsubscribe();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-80 h-screen border-r border-border/40 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Gruplarda Ara"
            className="pl-9 bg-accent/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible className="px-2">
          {filteredTeams.map((team, index) => (
            <AccordionItem key={team.name} value={`team-${index}`} onChange={(isOpen) => {
              if (isOpen) {
                setExpandedItems([`team-${index}`]);
              } else {
                setExpandedItems([]);
              }
            }}>
              <AccordionTrigger
                className="px-2 hover:no-underline hover:bg-accent/10"
                onClick={() => onGroupSelect(team.id)}
              >
                {team.name}
              </AccordionTrigger>
              <AccordionContent className="pt-0">
                <GroupMembersList groupId={team.id} currentUserRole="member" />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
