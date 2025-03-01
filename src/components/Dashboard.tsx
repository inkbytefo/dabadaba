import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useMessagingStore } from '@/store/messaging';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  MessageSquare,
  Users,
  Bell,
  Phone,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// TypeScript interfaces for data structure
interface DashboardStats {
  totalConversations: number;
  unreadMessages: number;
  activeChats: number;
  recentContacts: number;
}

const Dashboard: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<DashboardStats>({
    totalConversations: 0,
    unreadMessages: 0,
    activeChats: 0,
    recentContacts: 0
  });

  // İstatistikleri yükle
  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const activeChats = snapshot.docs.filter(doc => 
          doc.data().lastMessageTimestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        const unreadMessages = snapshot.docs.reduce(
          (total, doc) => total + (doc.data().unreadCount || 0),
          0
        );

        setStats({
          totalConversations: snapshot.size,
          unreadMessages,
          activeChats,
          recentContacts: snapshot.docs.reduce((total, doc) => 
            total + Object.keys(doc.data().participants || {}).length, 0
          )
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Lütfen giriş yapın</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Yeni Mesaj',
      icon: MessageSquare,
      onClick: () => navigate('/messages'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Gruplar',
      icon: Users,
      onClick: () => navigate('/messages/groups'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Bildirimler',
      icon: Bell,
      onClick: () => navigate('/notifications'),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Aramalar',
      icon: Phone,
      onClick: () => navigate('/calls'),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Hoşgeldin Mesajı */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          Hoş geldin, {user.displayName || 'Kullanıcı'}
        </h1>
        <p className="text-muted-foreground">
          İşte hesabınızla ilgili güncel bilgiler ve istatistikler
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Konuşma"
          value={stats.totalConversations}
          icon={MessageSquare}
          trend="+5% geçen haftaya göre"
        />
        <StatCard
          title="Okunmamış Mesaj"
          value={stats.unreadMessages}
          icon={Bell}
          trend="2 yeni mesaj"
          highlight={stats.unreadMessages > 0}
        />
        <StatCard
          title="Aktif Sohbetler"
          value={stats.activeChats}
          icon={Users}
          trend="3 aktif konuşma"
        />
        <StatCard
          title="Son Kişiler"
          value={stats.recentContacts}
          icon={UserPlus}
          trend="7 gün içinde"
        />
      </div>

      {/* Hızlı Erişim */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={action.onClick}
            >
              <div className={`${action.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <h3 className="font-medium">{action.title}</h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// İstatistik Kartı Bileşeni
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  highlight 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  trend: string; 
  highlight?: boolean; 
}) => (
  <Card className={`p-6 ${highlight ? 'border-blue-500/50 shadow-blue-500/10' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{trend}</p>
    </div>
  </Card>
);

export default Dashboard;