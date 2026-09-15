import { Compass, Home, Plus, ShieldCheck, ScrollText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import { useUserState } from '../../state/userStateContext';

function navClasses({ isActive }) {
  return `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
    isActive ? 'bg-inset text-content' : 'text-content hover:bg-surface-hover'
  }`;
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
      {children}
    </p>
  );
}

export function LeftSidebar() {
  const { user } = useAuth();
  const { memberships } = useUserState();

  return (
    <nav aria-label="Main navigation" className="flex flex-col pb-8">
      <NavLink to="/" end className={navClasses}>
        <Home aria-hidden="true" className="size-5" />
        Home
      </NavLink>
      <NavLink to="/communities" className={navClasses}>
        <Compass aria-hidden="true" className="size-5" />
        Explore communities
      </NavLink>

      <SectionLabel>Your communities</SectionLabel>
      {user ? (
        <>
          <NavLink to="/create-community" className={navClasses}>
            <Plus aria-hidden="true" className="size-5" />
            Create community
          </NavLink>
          {memberships.length ? (
            memberships.map((name) => (
              <NavLink key={name} to={`/r/${name}`} className={navClasses}>
                <span
                  aria-hidden="true"
                  className="flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
                >
                  r
                </span>
                <span className="truncate">r/{name}</span>
              </NavLink>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-muted">
              Join a community and it will show up here.
            </p>
          )}
        </>
      ) : (
        <p className="px-3 py-2 text-xs text-muted">Log in to see the communities you joined.</p>
      )}

      {user && (
        <>
          <SectionLabel>Insights</SectionLabel>
          <NavLink to="/admin" className={navClasses}>
            <ShieldCheck aria-hidden="true" className="size-5" />
            Activity
          </NavLink>
          <NavLink to="/audit-logs" className={navClasses}>
            <ScrollText aria-hidden="true" className="size-5" />
            Audit logs
          </NavLink>
        </>
      )}
    </nav>
  );
}
