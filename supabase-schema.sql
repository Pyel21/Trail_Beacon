-- Trail Beacon Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    medical_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'emergency', 'location', 'image')),
    is_emergency BOOLEAN DEFAULT FALSE,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_direct_or_group CHECK (
        (receiver_id IS NOT NULL AND group_id IS NULL) OR 
        (receiver_id IS NULL AND group_id IS NOT NULL)
    )
);

-- Chat groups table
CREATE TABLE chat_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_emergency_group BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat group members table
CREATE TABLE chat_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Emergency alerts table
CREATE TABLE emergency_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    location JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- User contacts table (for managing user relationships)
CREATE TABLE user_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'friend',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_id),
    CHECK (user_id != contact_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_emergency ON messages(is_emergency);

CREATE INDEX idx_chat_group_members_group_id ON chat_group_members(group_id);
CREATE INDEX idx_chat_group_members_user_id ON chat_group_members(user_id);

CREATE INDEX idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_alerts_created_at ON emergency_alerts(created_at);

CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_contact_id ON user_contacts(contact_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_groups_updated_at BEFORE UPDATE ON chat_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data and data of their contacts
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can read messages they sent or received" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = messages.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Chat groups policies
CREATE POLICY "Users can read groups they are members of" ON chat_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = chat_groups.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON chat_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat group members policies
CREATE POLICY "Users can read group members" ON chat_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_group_members cgm2
            WHERE cgm2.group_id = chat_group_members.group_id AND cgm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can add members" ON chat_group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = chat_group_members.group_id 
            AND user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Emergency alerts policies
CREATE POLICY "Users can read their own emergency alerts" ON emergency_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create emergency alerts" ON emergency_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency alerts" ON emergency_alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- User contacts policies
CREATE POLICY "Users can read their contacts" ON user_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add contacts" ON user_contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO users (id, email, name, phone, emergency_contact) VALUES
    ('demo-user-123', 'aleckzz@example.com', 'Aleckzz Palero', '+63 912 345 6789', '+63 987 654 3210'),
    ('user-1', 'sarah@example.com', 'Sarah Johnson', '+63 987 654 3210', '+63 912 345 6789'),
    ('user-2', 'mike@example.com', 'Mike Rodriguez', '+63 912 345 6789', '+63 987 654 3210'),
    ('user-3', 'dr.maria@example.com', 'Dr. Maria Santos', '+63 955 123 4567', '+63 912 345 6789');

-- Create a sample hiking group
INSERT INTO chat_groups (id, name, description, is_emergency_group, created_by) VALUES
    ('group-1', 'Mount Pulag Hiking Group', 'Charity hiking event group', FALSE, 'demo-user-123');

-- Add members to the group
INSERT INTO chat_group_members (group_id, user_id, role) VALUES
    ('group-1', 'demo-user-123', 'admin'),
    ('group-1', 'user-1', 'member'),
    ('group-1', 'user-2', 'member'),
    ('group-1', 'user-3', 'member');

-- Create user contacts
INSERT INTO user_contacts (user_id, contact_id, relationship) VALUES
    ('demo-user-123', 'user-1', 'friend'),
    ('demo-user-123', 'user-2', 'friend'),
    ('demo-user-123', 'user-3', 'doctor'),
    ('user-1', 'demo-user-123', 'friend'),
    ('user-2', 'demo-user-123', 'friend'),
    ('user-3', 'demo-user-123', 'patient');
