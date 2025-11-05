import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/reports', icon: BarChart2, label: 'التقارير' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:top-0 md:bottom-auto z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around md:justify-start md:gap-8 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

