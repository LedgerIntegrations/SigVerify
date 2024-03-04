-- Check if database exists and create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'sigverifydb') THEN
        CREATE DATABASE sigverifydb;
    END IF;
END
$$;

-- Dropping tables if they exist, ensuring to drop in the correct order to respect foreign key constraints
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS document_s3_mapping CASCADE;
DROP TABLE IF EXISTS document_access CASCADE;
DROP TABLE IF EXISTS aws_s3_buckets CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS xrpl_wallets CASCADE;
DROP TABLE IF EXISTS user_contacts CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_credentials CASCADE;

-- Re-create the ENUM for membership type
CREATE TYPE membership_type AS ENUM ('free', 'standard', 'premium');

CREATE TYPE access_type AS ENUM ('view', 'sign');

-- User credentials
CREATE TABLE user_credentials (
    id serial8 PRIMARY KEY,
    hashed_email character varying(84) NOT NULL UNIQUE,
    hashed_password character varying(64),
    public_key character varying(455),
    auth_token character varying(64) UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- User profiles
CREATE TABLE user_profiles (
    id serial8 PRIMARY KEY,
    user_credentials_id bigint UNIQUE NOT NULL REFERENCES user_credentials(id),
    first_name character varying(42),
    last_name character varying(42),
    membership membership_type DEFAULT 'free',
    document_limit int,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- XRPL Wallets
CREATE TABLE xrpl_wallets (
    wallet_id serial8 PRIMARY KEY,
    user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
    wallet_address character varying(35) NOT NULL UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- User contacts
CREATE TABLE user_contacts (
    id serial8 PRIMARY KEY,
    user_profile_id bigint REFERENCES user_profiles(id),
    email character varying(84) NOT NULL UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- Documents
CREATE TABLE documents (
    id serial8 PRIMARY KEY,
    user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
    title character varying(255),
    description text,
    category character varying(255) NOT NULL,
    encrypted boolean default false,
    expires_at timestamptz,
    created_at timestamptz DEFAULT current_timestamp,
    updated_at timestamptz DEFAULT current_timestamp
);

-- AWS S3 Buckets
-- ! Store sensitive keys securely not in plain text
CREATE TABLE aws_s3_buckets (
    s3_bucket_id serial8 PRIMARY KEY,
    bucket_name character varying(255) NOT NULL UNIQUE,
    access_key_id character varying(255) NOT NULL,
    secret_access_key character varying(255) NOT NULL,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- Document S3 Mapping
CREATE TABLE document_s3_mapping (
    mapping_id serial8 PRIMARY KEY,
    document_id bigint NOT NULL REFERENCES documents(id),
    s3_bucket_id bigint NOT NULL REFERENCES aws_s3_buckets(s3_bucket_id),
    s3_object_key character varying(255) NOT NULL,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- Document Access
CREATE TABLE document_access (
   access_id serial8 PRIMARY KEY,
   document_id bigint NOT NULL REFERENCES documents(id),
   user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
   access_type access_type NOT NULL,
   created_at timestamptz DEFAULT current_timestamp,
   updated_at timestamptz DEFAULT current_timestamp
);

-- Signatures
CREATE TABLE signatures (
    id serial8 PRIMARY KEY,
    document_id bigint NOT NULL REFERENCES documents(id),
    user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
    xrpl_tx_hash character(64),
    signed_at timestamptz DEFAULT current_timestamp
);

-- Functions to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_document_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.membership = 'free' THEN
        NEW.document_limit := 5;
    ELSIF NEW.membership = 'standard' THEN
        NEW.document_limit := 50;
    ELSIF NEW.membership = 'premium' THEN
        NEW.document_limit := -1; -- unlimited
    ELSE
        NEW.document_limit := 5; -- default
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatically updating 'updated_at' fields
CREATE TRIGGER change_updated_at_user_credentials
BEFORE UPDATE ON user_credentials
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_xrpl_wallets
BEFORE UPDATE ON xrpl_wallets
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_aws_s3_buckets
BEFORE UPDATE ON aws_s3_buckets
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_document_s3_mapping
BEFORE UPDATE ON document_s3_mapping
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_document_access
BEFORE UPDATE ON document_access
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_signatures
BEFORE UPDATE ON signatures
FOR EACH ROW EXECUTE FUNCTION update_modified_at();