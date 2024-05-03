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
  DROP TABLE IF EXISTS document_access CASCADE;
  DROP TABLE IF EXISTS documents CASCADE;
  DROP TABLE IF EXISTS document_blobs CASCADE;
  DROP TABLE IF EXISTS user_contacts CASCADE;
  DROP TABLE IF EXISTS xrpl_wallets CASCADE;
  DROP TABLE IF EXISTS user_profiles CASCADE;
  DROP TABLE IF EXISTS user_credentials CASCADE;

  -- Re-create the ENUM for membership type
  CREATE TYPE membership_type AS ENUM ('free', 'standard', 'premium', 'business');

  -- TODO: add last_logout_at
  CREATE TABLE user_credentials (
      id serial8 PRIMARY KEY,
      hashed_email character varying(84) NOT NULL UNIQUE,
      hashed_password character varying(64),
      public_key character varying(455) UNIQUE,
      auth_token character varying(64) UNIQUE,
      reset_pw_token character varying(64) UNIQUE,
      reset_pw_sent_at timestamp default null,
      sign_in_count int default 0 NOT NULL,
      current_sign_in_at timestamp,
      last_sign_in_at timestamp,
      current_sign_in_ip character varying(120),
      last_sign_in_ip character varying(120),
      failed_attempts integer default 0 NOT NULL,
      unlock_token character varying(64) UNIQUE,
      locked_at timestamp,
      archived_at timestamp,
      created_at timestamp default current_timestamp,
      updated_at timestamp default current_timestamp
  );

  CREATE TABLE user_profiles (
      id serial8 PRIMARY KEY,
      user_credentials_id bigint UNIQUE NOT NULL REFERENCES user_credentials(id),
      first_name character varying(42),
      last_name character varying(42),
      membership membership_type DEFAULT 'free',
      document_limit int,
      created_at timestamp default current_timestamp,
      updated_at timestamp default current_timestamp
  );

  CREATE TABLE xrpl_wallets (
      wallet_id serial8 PRIMARY KEY,
      user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
      wallet_address character varying(35) NOT NULL UNIQUE,
      created_at timestamp default current_timestamp,
      updated_at timestamp default current_timestamp
  );

  CREATE TABLE user_contacts (
      id serial8 PRIMARY KEY,
      user_profile_id bigint REFERENCES user_profiles(id),
      email character varying(84) NOT NULL UNIQUE,
      created_at timestamp default current_timestamp,
      updated_at timestamp default current_timestamp
  );

  -- TODO: currently one-to-one do we need to change to many blobs to one document?
  CREATE TABLE documents (
      id serial8 PRIMARY KEY,
      user_profile_id bigint NOT NULL REFERENCES user_profiles(id),
      title character varying(255),
      description text,
      category character varying(255) NOT NULL,
      public boolean default false,
      can_add_access boolean default true,
      expires_at timestamp DEFAULT null,
      created_at timestamp DEFAULT current_timestamp,
      updated_at timestamp DEFAULT current_timestamp
  );

  CREATE TABLE document_blobs (
      id serial8 PRIMARY KEY,
      document_id bigint NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      filename character varying(144) NOT NULL,
      content_type character varying(64),
      byte_size bigint NOT NULL,
      checksum character varying(84),
      s3_object_key character varying(255) NOT NULL,
      s3_object_url text,
      created_at timestamp DEFAULT current_timestamp
  );

  -- ! make sure only the uploader of the linked document has rights to modify
  -- * ability to have either email, wallet, or profile_id as link to recipeint because if user doesnt exist, they can later authenticate a wallet or email to create an account and then have access
  CREATE TABLE document_access (
      id serial8 PRIMARY KEY,
      document_id bigint NOT NULL REFERENCES documents(id),
      email character varying(84),
      wallet_address character varying(35),
      created_at timestamp DEFAULT current_timestamp,
      updated_at timestamp DEFAULT current_timestamp,
      CONSTRAINT chk_email_wallet CHECK (
          (email IS NOT NULL AND email <> '') OR
          (wallet_address IS NOT NULL AND wallet_address <> '')
      )
  );

  -- Signatures
  CREATE TABLE signatures (
      id serial8 PRIMARY KEY,
      document_id bigint NOT NULL REFERENCES documents(id),
      xrpl_tx_hash character(64),
      signer_wallet_address character varying(35) NOT NULL,
      document_checksum character varying(84) NOT NULL,
      created_at timestamp DEFAULT current_timestamp,
      UNIQUE(document_id, signer_wallet_address)
  );

  -- -- Wallet To Email Mapper
  -- CREATE TABLE WALLETMAP (
  --   id serial8 PRIMARY KEY,
  --   wallet_address character varying(35) NOT NULL,
  --   email character varying(84) NOT NULL
  -- )

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
          NEW.document_limit := 25;
      ELSIF NEW.membership = 'premium' THEN
          NEW.document_limit := 100;
      ELSIF NEW.membership = 'business' THEN
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

  CREATE TRIGGER change_updated_at_user_contacts
  BEFORE UPDATE ON user_contacts
  FOR EACH ROW EXECUTE FUNCTION update_modified_at();

  CREATE TRIGGER change_updated_at_documents
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_modified_at();

  CREATE TRIGGER change_updated_at_document_access
  BEFORE UPDATE ON document_access
  FOR EACH ROW EXECUTE FUNCTION update_modified_at();

  CREATE TRIGGER set_document_limit_before_insert
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_document_limit();

  CREATE TRIGGER set_document_limit_before_update
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_document_limit();