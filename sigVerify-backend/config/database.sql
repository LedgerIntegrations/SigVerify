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

-- A single user_auth record can only have one corresponding user_meta record.
CREATE TABLE user_auth (
    id serial8 PRIMARY KEY,
    hashed_email character varying(64) NOT NULL UNIQUE,
    hashed_password character varying(64),
    auth_token character varying(64) UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

-- A single user_meta record can have multiple user_email records associated with it.
CREATE TABLE user_meta (
    id serial8 PRIMARY KEY,
    user_auth_id bigint UNIQUE NOT NULL REFERENCES user_auth(id),
    first_name character varying(42),
    last_name character varying(42),
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

CREATE TABLE user_email (
    id serial8 PRIMARY KEY,
    user_meta_id bigint REFERENCES user_meta(id),
    email character varying(84) NOT NULL UNIQUE,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

CREATE TABLE documents (
    id serial8 PRIMARY KEY,
    user_meta_id bigint NOT NULL REFERENCES user_meta(id),
    document_name character varying(255) NOT NULL,
    document_type character varying(55) NOT NULL,
    document_size bigint NOT NULL,
    document_key character varying(255),
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



-- CREATE TABLE user_files (
--     id serial8 PRIMARY KEY,
--     user_auth_id bigint NOT NULL REFERENCES user_auth(id),
--     file_name character varying(255) NOT NULL,
--     file_type character varying(50),
--     file_size bigint,
--     file_path character varying(255),
--     created_at timestamptz DEFAULT current_timestamp,
--     updated_at timestamptz DEFAULT current_timestamp
-- );


-- TEMPORARY IMPLEMENTATION OF FUTURE DOCUMENT TABLES AND SIGNATURE TAG

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