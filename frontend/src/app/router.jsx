import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AdminPage } from '../pages/AdminPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { CommunitiesPage } from '../pages/CommunitiesPage';
import { CommunityPage } from '../pages/CommunityPage';
import { CreateCommunityPage } from '../pages/CreateCommunityPage';
import { CreatePostPage } from '../pages/CreatePostPage';
import { ErrorPage } from '../pages/ErrorPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { SearchPage } from '../pages/SearchPage';
import { SignupPage } from '../pages/SignupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        // A pathless wrapper so a thrown route error renders inside the app shell
        // instead of replacing the whole page.
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'communities', element: <CommunitiesPage /> },
          { path: 'r/:communityName', element: <CommunityPage /> },
          { path: 'r/:communityName/posts/:postId', element: <PostDetailPage /> },
          { path: 'posts/:postId', element: <PostDetailPage /> },
          { path: 'u/:username', element: <ProfilePage /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'submit', element: <CreatePostPage /> },
              { path: 'r/:communityName/submit', element: <CreatePostPage /> },
              { path: 'create-community', element: <CreateCommunityPage /> },
              { path: 'admin', element: <AdminPage /> },
              { path: 'audit-logs', element: <AuditLogsPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
