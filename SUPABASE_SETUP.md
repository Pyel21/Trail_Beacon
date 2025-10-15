# Supabase Setup Guide for Trail Beacon

This guide will help you set up Supabase for cloud messaging in your Trail Beacon app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `trail-beacon`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" (gear icon)
3. Go to "API" section
4. Copy the following:
   - Project URL
   - Anon (public) key

## 3. Update Configuration

Update `mobile/src/config/supabase.ts` with your credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

## 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create all necessary tables, indexes, and sample data.

## 5. Configure Authentication (Optional)

If you want to add user authentication:

1. Go to "Authentication" in your Supabase dashboard
2. Configure your preferred auth providers
3. Update the MessagingService to handle authentication

## 6. Test the Integration

1. Run your React Native app
2. Navigate to the Home screen
3. Tap the chat icon (💬) to open contacts
4. Try sending messages between users
5. Test emergency alerts

## Database Tables Created

- **users**: User profiles and information
- **messages**: Chat messages between users
- **chat_groups**: Group chat rooms
- **chat_group_members**: Group membership
- **emergency_alerts**: Emergency SOS alerts
- **user_contacts**: User relationships

## Features Included

### ✅ Real-time Messaging
- Instant message delivery
- Real-time updates
- Message history

### ✅ Group Chats
- Create hiking groups
- Group messaging
- Member management

### ✅ Emergency Alerts
- Emergency SOS system
- Location-based alerts
- Alert status tracking

### ✅ User Management
- User profiles
- Contact management
- Medical information

## Security Features

- Row Level Security (RLS) enabled
- User-specific data access
- Secure message delivery
- Protected emergency alerts

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your Supabase URL and key
2. **Permission Denied**: Ensure RLS policies are set up correctly
3. **Messages Not Loading**: Check if the database schema was created properly

### Debug Steps

1. Check Supabase logs in the dashboard
2. Verify your credentials in the config file
3. Test database queries in the SQL editor
4. Check network connectivity

## Next Steps

1. Set up push notifications for real-time alerts
2. Add file/image sharing capabilities
3. Implement user authentication
4. Add message encryption for security
5. Set up backup and monitoring

## Support

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Trail Beacon GitHub: [Your GitHub Repo]
- Community Discord: [Your Discord Server]
