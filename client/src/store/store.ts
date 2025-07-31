import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import loansReducer from './slices/loansSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    loans: loansReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;