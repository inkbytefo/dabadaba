import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Mock data - replace with real data later
const teams = [
  {
    name: "Marketing Team",
    items: ["Social Media Accounts", "Analytics Tools", "Content Calendar"]
  },
  {
    name: "Design Team Keys",
    items: ["Adobe Suite", "Figma Pro", "Stock Photos Access"]
  },
  {
    name: "Development",
    items: ["AWS Credentials", "GitHub Access", "Database Passwords"]
  }
];

export const TeamList = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-80 h-screen border-r border-border/40 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Secure Passwords"
            className="pl-9 bg-accent/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="px-2">
          {filteredTeams.map((team, index) => (
            <AccordionItem key={team.name} value={`team-${index}`}>
              <AccordionTrigger className="px-2 hover:no-underline hover:bg-accent/10">
                {team.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {team.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className="w-full px-4 py-2 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
                      onClick={() => {}}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
