declare type dbDashboardUserType = {
    id: string | undefined;
    username: string | undefined;
    password_hash: string | undefined;
    role: 'admin' | 'manager' | 'support';
    email: string | undefined;
    created_at: string | undefined;
  };