import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, tokenManager, userStorage } from '../services';
import { queryKeys } from '../lib/queryClient';
import type {
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  AuthResponse,
  User,
} from '../types';

/**
 * Hook: useProfile
 * Fetches the current authenticated user's profile
 * 
 * Features:
 * - Automatically refetches on window focus
 * - Caches user data for 5 minutes
 * - Only runs if user is authenticated
 */
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.user;
    },
    enabled: tokenManager.isAuthenticated(), // Only run if logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook: useRegister
 * Handles user registration
 * 
 * Features:
 * - Stores token and user data on success
 * - Returns mutation state (loading, error, success)
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response: AuthResponse) => {
      // Store token and user data
      tokenManager.setToken(response.token);
      userStorage.setUser(response.user);
      
      // Update cache with user data
      queryClient.setQueryData(queryKeys.auth.profile(), response.user);
    },
  });
};

/**
 * Hook: useLogin
 * Handles user login
 * 
 * Features:
 * - Stores token and user data on success
 * - Updates query cache immediately
 * - Returns mutation state
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response: AuthResponse) => {
      // Store token and user data
      tokenManager.setToken(response.token);
      userStorage.setUser(response.user);
      
      // Update cache with user data (optimistic update)
      queryClient.setQueryData(queryKeys.auth.profile(), response.user);
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

/**
 * Hook: useLogout
 * Handles user logout
 * 
 * Features:
 * - Clears all cached data
 * - Removes tokens and user data
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear storage
      tokenManager.removeToken();
      userStorage.removeUser();
    },
    onSuccess: () => {
      // Clear all cache
      queryClient.clear();
    },
  });
};

/**
 * Hook: useUpdateProfile
 * Updates user profile
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Rolls back on error
 * - Invalidates profile cache on success
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.profile() });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.auth.profile());
      
      // Optimistically update cache
      if (previousUser) {
        queryClient.setQueryData(queryKeys.auth.profile(), {
          ...previousUser,
          ...newData,
        });
      }
      
      return { previousUser };
    },
    
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.profile(), context.previousUser);
      }
    },
    
    // On success, refetch to ensure consistency
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.profile(), response.user);
      userStorage.setUser(response.user);
    },
  });
};

/**
 * Hook: useDeleteAccount
 * Deletes user account
 * 
 * Features:
 * - Clears all data on success
 * - Logs user out
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      tokenManager.removeToken();
      userStorage.removeUser();
      queryClient.clear();
    },
  });
};
