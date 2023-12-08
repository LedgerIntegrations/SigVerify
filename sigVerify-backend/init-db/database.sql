-- Check if database exists and create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'sigverifydb') THEN
        CREATE DATABASE sigverifydb;
    END IF;
END
$$;

DROP TABLE IF EXISTS user_meta CASCADE;
DROP TABLE IF EXISTS user_email CASCADE;
DROP TABLE IF EXISTS user_auth CASCADE;

CREATE TYPE membership_type AS ENUM ('free', 'standard', 'premium');


-- GENERAL IMPROVEMENT THOUGHTS:
-- setting ON DELETE CASCADE or ON DELETE SET NULL Constraints depending on intended
-- default is ON DELETE NO ACTION which throws an error as a safeguard against inadvertently deleting data that other parts of your database depend on

-- user_auth table has a one-to-one relationship with the user_meta table, enforced by the UNIQUE constraint on user_auth_id in user_meta.
-- hashed_email and hashed_password lengths are sufficient?
CREATE TABLE user_auth (
    id serial8 PRIMARY KEY,
    hashed_email character varying(64) NOT NULL UNIQUE,
    hashed_password character varying(64),
    auth_token character varying(64) UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- UNIQUE constraint on user_auth_id ensures that each user_auth record can only be associated with one user_meta record, maintaining a one-to-one relationship.
-- TODO: future implementations: country, state, address, zip, membership_level,
-- TODO: should verified_xrpl_wallet_address be unique? ( each wallet address can only be associated with one user_meta record )
--TODO: do we need document limit? client is displaying limits based on membership string
CREATE TABLE user_meta (
    id serial8 PRIMARY KEY,
    user_auth_id bigint UNIQUE NOT NULL REFERENCES user_auth(id),
    first_name character varying(42),
    last_name character varying(42),
    verified_xrpl_wallet_address character varying(35) default null,
    membership membership_type DEFAULT 'free',
    document_limit int,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- user_email table allows for a one-to-many relationship between user_meta and user_email, enabling multiple email addresses per user.
-- length of email (84 characters) is sufficient for all possible email addresses?
CREATE TABLE user_email (
    id serial8 PRIMARY KEY,
    user_meta_id bigint REFERENCES user_meta(id),
    email character varying(84) NOT NULL UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- This table has a many-to-one relationship with user_meta, allowing each user to have multiple documents.
-- need any additional metadata about documents, like a description or tags
CREATE TABLE documents (
    id serial8 PRIMARY KEY,
    user_meta_id bigint NOT NULL REFERENCES user_meta(id),
    document_name character varying(255) NOT NULL,
    document_type character varying(55) NOT NULL,
    document_size bigint NOT NULL,
    document_s3_key character varying(255),
    expires_at timestamptz,
    -- status character varying(20) NOT NULL,
    created_at timestamptz DEFAULT current_timestamp,
    updated_at timestamptz DEFAULT current_timestamp
);

-- signatures table links to the documents and user_meta tables, allowing the tracking of who signed which document.
-- Ensure that expires_at can be null if a signature does not expire.
CREATE TABLE signatures (
    id serial8 PRIMARY KEY,
    document_id bigint NOT NULL REFERENCES documents(id),
    user_id bigint NOT NULL REFERENCES user_meta(id),
    xrpl_tx_hash character(64),
    signed_at timestamptz DEFAULT current_timestamp
);

-- establishes a many-to-many relationship between users and documents through sender_id, receiver_id, and document_id. It tracks the sharing activity of documents between users.
-- consider enumerating the possible values the 'status' field can take for clarity and data integrity
CREATE TABLE document_sharing (
    id serial8 PRIMARY KEY,
    sender_id bigint NOT NULL REFERENCES user_meta(id),
    receiver_id bigint NOT NULL REFERENCES user_meta(id),
    document_id bigint NOT NULL REFERENCES documents(id),
    sent_at timestamptz DEFAULT current_timestamp
);

-- Junction table for documents and required signers
CREATE TABLE document_required_signers (
    document_id bigint NOT NULL REFERENCES documents(id),
    user_email_id bigint NOT NULL REFERENCES user_email(id),
    PRIMARY KEY (document_id, user_email_id),
    created_at timestamptz DEFAULT current_timestamp,
    updated_at timestamptz DEFAULT current_timestamp
);

-- Function to update modified_at
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
        NEW.document_limit := -1; -- Indicates unlimited
    ELSE
        NEW.document_limit := 5; -- Default case
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to use the above function
CREATE TRIGGER change_updated_at_user_meta
BEFORE UPDATE ON user_meta
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_user_email
BEFORE UPDATE ON user_email
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_user_auth
BEFORE UPDATE ON user_auth
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_documents
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_document_required_signers
BEFORE UPDATE ON document_required_signers
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER user_meta_before_insert_or_update
BEFORE INSERT OR UPDATE ON user_meta
FOR EACH ROW EXECUTE FUNCTION set_document_limit();


-- POSSIBLE TABLE ADDITIONS / MODIFICATIONS

-- CREATE TABLE document_bundle (
--     id serial8 PRIMARY KEY,
--     name character varying(255) NOT NULL,
--     description character varying(500),
--     totalPages
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE document (
--     id serial8 PRIMARY KEY,
--     bundle_id bigint NOT NULL REFERENCES document_bundle(id),
--     document_type_id bigint NOT NULL REFERENCES document_type(id),
--     document_name character varying(255) NOT NULL,
--     document_hash character varying(255) NOT NULL,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE document_type (
--     id serial8 PRIMARY KEY,
--     type_name character varying(255) NOT NULL,
--     description text,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE signature_tag (
--     id serial8 PRIMARY KEY,
--     document_id bigint NOT NULL REFERENCES document(id),
--     tagger_id bigint NOT NULL,
--     tag_data jsonb,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );