import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import notificationsService from '../../services/notificationsService';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security' | 'loan' | 'account';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
  data?: any;
  category?: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  realTimeConnected: boolean;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
    accountUpdates: boolean;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  realTimeConnected: false,
  preferences: {
    email: true,
    sms: true,
    push: true,
    inApp: true,
    transactionAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    accountUpdates: true,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { page?: number; limit?: number; unreadOnly?: boolean }, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getNotifications(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      await notificationsService.markAsRead(notificationIds);
      return notificationIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences: Partial<NotificationsState['preferences']>, { rejectWithValue }) => {
    try {
      const response = await notificationsService.updatePreferences(preferences);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

export const sendTestNotification = createAsyncThunk(
  'notifications/sendTestNotification',
  async (type: 'email' | 'sms' | 'push', { rejectWithValue }) => {
    try {
      await notificationsService.sendTestNotification(type);
      return { type, message: 'Test notification sent successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send test notification');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setRealTimeConnection: (state, action: PayloadAction<boolean>) => {
      state.realTimeConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.notifications) {
          state.notifications = action.payload.notifications;
          state.unreadCount = action.payload.unreadCount || 0;
        } else {
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        state.notifications.forEach(notification => {
          if (notificationIds.includes(notification.id) && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount -= 1;
          }
        });
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      })
      
      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearAllNotifications,
  setRealTimeConnection,
  clearError,
  updateUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;