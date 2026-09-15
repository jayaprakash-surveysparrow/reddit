import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Menu as MenuIcon, Plus, Search, User } from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { useToast } from '../../toast/toastContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Menu, MenuItem } from '../ui/Menu';
import { ThemeToggle } from './ThemeToggle';

export function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-3 px-4">
        <IconButton
          icon={MenuIcon}
          label="Open navigation menu"
          onClick={onMenuClick}
          className="md:hidden"
        />

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-brand text-base font-bold text-white"
          >
            r
          </span>
          <span className="hidden text-lg font-bold text-content sm:inline">reddit-clone</span>
        </Link>

        <form onSubmit={handleSearch} role="search" className="mx-auto hidden max-w-xl flex-1 sm:block">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            />
            <Input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search Reddit-clone"
              aria-label="Search posts, communities and people"
              className="rounded-full bg-inset pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <IconButton as={Link} to="/search" icon={Search} label="Search" className="sm:hidden" />
          <ThemeToggle />

          {user ? (
            <>
              <Button as={Link} to="/submit" size="sm" variant="secondary" className="max-sm:hidden">
                <Plus aria-hidden="true" className="size-4" />
                Create
              </Button>
              <IconButton as={Link} to="/submit" icon={Plus} label="Create post" className="sm:hidden" />
              <Menu
                label="Account menu"
                trigger={
                  <span className="flex items-center gap-2 rounded-full p-1">
                    <Avatar name={user.username} size="sm" />
                    <span className="hidden max-w-24 truncate text-xs font-bold text-content lg:inline">
                      {user.username}
                    </span>
                  </span>
                }
              >
                <MenuItem as={Link} to={`/u/${user.username}`} icon={User}>
                  My profile
                </MenuItem>
                <MenuItem onClick={handleLogout} icon={LogOut}>
                  Log out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" size="sm" variant="outline">
                Log in
              </Button>
              <Button as={Link} to="/signup" size="sm" className="max-sm:hidden">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
