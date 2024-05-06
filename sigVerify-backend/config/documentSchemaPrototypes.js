const testDocumentSchemaData = {
    schema: 'ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU',
    nftType: 'art.v0',
    name: 'SigvVerify Document #{databaseId#}',
    description: 'Standardized JSON format for storing of encrypted document data on IPFS.',
    image: '{path to image of sigverify logo}',
    collection: {
        name: 'XLS-24D Compatible SigVerify Document Standard',
        family: 'SigVerify Document IPFS Standard',
    },
    metadata: metaData,
    encrypted: true,
    required_signers: ['rAddress1', 'rAddress2'],
    attributes: [
        {
            trait_type: 'encrypted_data',
            description: 'The actual encrypted data of the document, Base64-encoded',
            value: encrypted_data,
        },
        {
            trait_type: 'encrypted_aes_key',
            description: "AES key encrypted with the recipient's public key, Base64-encoded",
            value: encrypted_aes_key,
        },
        {
            trait_type: 'iv_base64',
            description: 'Initialization vector for the encryption, in Base64 format',
            value: iv_base64,
        },
        {
            trait_type: 'encrypted_data_format',
            description: 'Format of the encrypted data (base64)',
            value: encrypted_data_format,
        },
        {
            trait_type: 'encryption_algorithm',
            description: 'Algorithm used for encryption (AES-GCM)',
            value: encryption_algorithm,
        },
        {
            trait_type: 'encryption_aes_key_length',
            description: 'Length of the AES-GCM encryption key in bits (number)',
            value: encryption_aes_key_length,
        },
        {
            trait_type: 'encryption_aes_key_hash',
            description: 'Hash of the AES-GCM encryption key for verification purposes (SHA-512)',
            value: encryption_aes_key_hash,
        },
        {
            trait_type: 'original_file_name',
            description: 'Original name of uploaded file',
            value: original_file_name,
        },
        {
            trait_type: 'original_file_format',
            description: 'Format of the original file before encryption (e.g., pdf, docx)',
            value: original_file_format,
        },
        {
            trait_type: 'original_file_size',
            description: 'Size of the original file before encryption, in bytes (number)',
            value: original_file_size,
        },
        {
            trait_type: 'original_file_hash',
            description: 'Hash of the original file for integrity check (SHA-512)',
            value: original_file_hash,
        },
    ],
};


// example prototype unencrypted document on ipfs
const onbee = {
    schema: 'ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU',
    nftType: 'document.v0',
    name: 'test txt1',
    description: 'testing txt doc upload',
    image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
    encrypted: true,
    collection: { name: 'SigVerify Document Collection', family: 'SigVerify' },
    attributes: [
        {
            trait_type: 'original_file_name',
            value: 'test1.txt',
            description: 'Original name of the file',
        },
        {
            trait_type: 'original_file_format',
            value: 'text/plain',
            description: 'Format of the original file',
        },
        {
            trait_type: 'original_file_size',
            value: 88,
            description: 'Size of the original file in bytes',
        },
        {
            trait_type: 'original_file_hash',
            value: '17bf4b46701313ea8fbaf838c24b8647d39bff0a9d2b45f403cb72ba420bd4bd',
            description: 'Hash of the original file for integrity check',
        },
        {
            trait_type: 'required_signers',
            value: 'rUBCFsgC2cMueUh8sNFA9KsSbzYoUnbUk8',
            description: 'List of sha256 email hashes required to sign the document',
        },
        {
            trait_type: 'unencrypted_data',
            value: 'SGVsbG8sIHRoaXMgaXMgYSBzaWd2ZXJpZnkgdGVzdCAudHh0IGRvY3VtZW50LiBJZiB5b3UgYXJlIHJlYWRpbmcgdGhpcyB5b3UgYXJlIHNwZWNpYWwhCg==',
            description: 'Unencrypted data of the document',
        },
        {
            trait_type: 'unencrypted_data_format',
            value: 'base64',
            description: 'Format of the unencrypted data',
        },
    ],
};

// unencrypted format requiring attribute fields without listing them specifically
const schema1 = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['schema', 'nftType', 'name', 'description', 'image', 'encrypted', 'collection', 'attributes'],
    properties: {
        schema: {
            type: 'string',
            format: 'uri',
        },
        nftType: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        image: {
            type: 'string',
            format: 'uri',
        },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: {
                name: {
                    type: 'string',
                },
                family: {
                    type: 'string',
                },
            },
        },
        attributes: {
            type: 'array',
            minItems: 7,
            items: {
                type: 'object',
                required: ['trait_type', 'value', 'description'],
                properties: {
                    trait_type: {
                        type: 'string',
                        enum: [
                            'original_file_name',
                            'original_file_format',
                            'original_file_size',
                            'original_file_hash',
                            'required_signers',
                            'unencrypted_data',
                            'unencrypted_data_format',
                        ],
                    },
                    value: {
                        type: ['string', 'integer', 'number'],
                    },
                    description: {
                        type: 'string',
                    },
                },
            },
        },
    },
};

// example prototype encrypted document on ipfs
const geeeee = {
    schema: 'ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU',
    nftType: 'encrypted_document.v0',
    name: 'test txt1',
    description: 'testing txt doc upload',
    image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
    collection: { name: 'SigVerify Document Collection', family: 'SigVerify' },
    attributes: [
        {
            trait_type: 'original_file_name',
            value: 'test1.txt',
            description: 'Original name of the file',
        },
        {
            trait_type: 'original_file_format',
            value: 'text/plain',
            description: 'Format of the original file',
        },
        {
            trait_type: 'original_file_size',
            value: 88,
            description: 'Size of the original file in bytes',
        },
        {
            trait_type: 'original_file_hash',
            value: '17bf4b46701313ea8fbaf838c24b8647d39bff0a9d2b45f403cb72ba420bd4bd',
            description: 'Hash of the original file for integrity check',
        },
        {
            trait_type: 'required_signers',
            value: 'cdf217d54eaca7689c15e04ebebd5ed0dde4d51fdfe76fe49f083bd8c9dc96ef',
            description: 'List of sha256 email hashes required to sign the document',
        },
        {
            trait_type: 'encrypted_data',
            value: 'YPBJFACx28C9yLwfUVJO9ql4OQLyMculxBrt7xQW87Rs/mQIemrkj9ZoCmv+5dDdRhwZBMSZ7Xv2WdlOnqT4RDscN3CC1VFZPFyl2PDCVx8nNn9606UfnJwxMYa4HblPQqd+ko5+RY0=',
            description: 'AES-GCM Encrypted data of the document encoded in base64',
        },
        {
            trait_type: 'encrypted_aes_key',
            value: 'BKQNuUR9tcehHnf+CzFAjokNZL8OBKvkSwKYYQs2cuqY3xOeHJfisIyY58nNWMtLYdKqSkPOWbROvCqD8D1pp9aMlUo84+yum1lypUhJpqyUSK6gkAVuODJlIcUDjmb+djHDeYPSgdAjz1A3m3B/MzlEdfHr6bmg+PAPNH042N//6VqPCI6iYGnsyDJEU2xV2zsngajNQfsmXrIEfTsNMVToRe5vZk/cz1zzKOjdq+WyQyWH4hzlFOIZ1Hg2o4LSKhorDwx3cgalIblkGf03DZzXNNvnfdZd2LHnaaPrfgtJe9en07+vBYREmFZX0kkovIC+92/Jbbz8G91m7CFNQQ==',
            description: 'RSA-OAEP Encrypted AES key encoded in base64',
        },
        {
            trait_type: 'iv_base64',
            value: 'kCVwBYd0BOR2NjsZ',
            description: 'Initialization vector in Base64 format',
        },
        {
            trait_type: 'encrypted_data_format',
            value: 'base64',
            description: 'Format of the encrypted data attribute.',
        },
        {
            trait_type: 'encryption_algorithm',
            value: 'AES-GCM',
            description: 'Algorithm used for encryption of raw document data.',
        },
        {
            trait_type: 'encryption_aes_key_length',
            value: 256,
            description: 'Length of the AES encryption key in bits',
        },
        {
            trait_type: 'encryption_aes_key_hash',
            value: 'BzySaAF8sfXOlyYEZSWeO5Wxnh5Sd/g5SurPYhARTkSTAzjYIXBBs70Dv1pNMO9xJE2+KPSUtGlpGDTEUjtpfg==',
            description: 'Sha-512 hash of the raw exported AES encryption key. Used for key authentication.',
        },
    ],
};

// encrypted format requiring attribute fields without listing them specifically
const schema2 = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['schema', 'nftType', 'name', 'description', 'image', 'collection', 'attributes', 'encrypted'],
    properties: {
        schema: {
            type: 'string',
            format: 'uri',
        },
        nftType: {
            type: 'string',
            pattern: 'encrypted_document.v[0-9]+',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        image: {
            type: 'string',
            format: 'uri',
        },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: {
                name: {
                    type: 'string',
                },
                family: {
                    type: 'string',
                },
            },
        },
        attributes: {
            type: 'array',
            minItems: 12,
            items: {
                type: 'object',
                required: ['trait_type', 'value', 'description'],
                properties: {
                    trait_type: {
                        type: 'string',
                        enum: [
                            'original_file_name',
                            'original_file_format',
                            'original_file_size',
                            'original_file_hash',
                            'required_signers',
                            'encrypted_data',
                            'encrypted_aes_key',
                            'iv_base64',
                            'encrypted_data_format',
                            'encryption_algorithm',
                            'encryption_aes_key_length',
                            'encryption_aes_key_hash',
                        ],
                    },
                    value: {
                        type: ['string', 'integer', 'number'],
                    },
                    description: {
                        type: 'string',
                    },
                },
            },
        },
        encrypted: {
            type: 'boolean',
        },
    },
};

// encrypted json schema
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "schema",
    "nftType",
    "name",
    "description",
    "image",
    "collection",
    'original_file_name',
    'original_file_format',
    'original_file_size',
    'original_file_hash',
    'required_signers',
    'encrypted_data',
    'encrypted_aes_key',
    'iv_base64',
    'encrypted_data_format',
    'encryption_algorithm',
    'encryption_aes_key_length',
    'encryption_aes_key_hash',
    "encrypted",
  ],
  "properties": {
    "schema": {
      "type": "string",
      "format": "uri"
    },
    "nftType": {
      "type": "string",
      "pattern": "encrypted_document.v[0-9]+"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "image": {
      "type": "string",
      "format": "uri"
    },
    "collection": {
      "type": "object",
      "required": ["name", "family"],
      "properties": {
        "name": {
          "type": "string"
        },
        "family": {
          "type": "string"
        }
      }
    },
    "original_file_name": {
      "type": "string"
    },
    "original_file_format": {
      "type": "string"
    },
    "original_file_size": {
      "type": "integer"
    },
    "original_file_hash": {
      "type": "string"
    },
    "required_signers": {
      "type": "string"
    },
    "encrypted_data": {
      "type": "string"
    },
    "encrypted_aes_key": {
      "type": "string"
    },
    "iv_base64": {
      "type": "string"
    },
    "encrypted_data_format": {
      "type": "string"
    },
    "encryption_algorithm": {
      "type": "string"
    },
    "encryption_aes_key_length": {
      "type": "integer"
    },
    "encryption_aes_key_hash": {
      "type": "string"
    },
    "encrypted": {
      "type": "boolean"
    }
  }
}

// unencrypted json schema
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "schema",
    "nftType",
    "name",
    "description",
    "image",
    "collection",
    "original_file_name",
    "original_file_format",
    "original_file_size",
    "original_file_hash",
    "required_signers",
    "unencrypted_data",
    "unencrypted_data_format",
    "encrypted"
  ],
  "properties": {
    "schema": {
      "type": "string",
      "format": "uri"
    },
    "nftType": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "image": {
      "type": "string",
      "format": "uri"
    },
    "collection": {
      "type": "object",
      "required": ["name", "family"],
      "properties": {
        "name": {
          "type": "string"
        },
        "family": {
          "type": "string"
        }
      }
    },
    "original_file_name": {
      "type": "string"
    },
    "original_file_format": {
      "type": "string"
    },
    "original_file_size": {
      "type": "integer"
    },
    "original_file_hash": {
      "type": "string"
    },
    "required_signers": {
      "type": "string"
    },
    "unencrypted_data": {
      "type": "string"
    },
    "unencrypted_data_format": {
      "type": "string"
    },
    "encrypted": {
      "type": "boolean"
    }
  }
}



const finalUnencrypted = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: [
        'schema',
        'nftType',
        'name',
        'description',
        'image',
        'collection',
        'requiredSigners',
        'encrypted',
        'documentData',
    ],
    properties: {
        schema: { type: 'string', format: 'uri' },
        nftType: { type: 'string', pattern: 'document.v[0-9]+' },
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'uri' },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: { name: { type: 'string' }, family: { type: 'string' } },
        },
        requiredSigners: { type: 'string' },
        encrypted: { type: 'boolean' },
        documentData: {
            type: 'object',
            properties: {
                originalFileName: { type: 'string' },
                originalFileFormat: { type: 'string' },
                originalFileSize: { type: 'integer' },
                originalFileHash: { type: 'string' },
                unencryptedData: { type: 'string' },
                unencryptedDataFormat: { type: 'string' },
            },
            required: [
                'originalFileName',
                'originalFileFormat',
                'originalFileSize',
                'originalFileHash',
                'unencryptedData',
                'unencryptedDataFormat',
            ],
        },
    },
};

const finalEncrypted = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: [
        'schema',
        'nftType',
        'name',
        'description',
        'image',
        'collection',
        'requiredSigners',
        'encrypted',
        'documentData',
    ],
    properties: {
        schema: { type: 'string', format: 'uri' },
        nftType: { type: 'string', pattern: 'encrypted_document.v[0-9]+' },
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'uri' },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: { name: { type: 'string' }, family: { type: 'string' } },
        },
        requiredSigners: { type: 'string' },
        encrypted: { type: 'boolean' },
        documentData: {
            type: 'object',
            properties: {
                originalFileName: { type: 'string' },
                originalFileFormat: { type: 'string' },
                originalFileSize: { type: 'integer' },
                originalFileHash: { type: 'string' },
                encryptedData: { type: 'string' },
                encryptedAesKey: { type: 'string' },
                ivBase64: { type: 'string' },
                encryptedDataFormat: { type: 'string' },
                encryptionAlgorithm: { type: 'string' },
                encryptionAesKeyLength: { type: 'integer' },
                encryptionAesKeyHash: { type: 'string' },
            },
            required: [
                'originalFileName',
                'originalFileFormat',
                'originalFileSize',
                'originalFileHash',
                'encryptedData',
                'encryptedAesKey',
                'ivBase64',
                'encryptedDataFormat',
                'encryptionAlgorithm',
                'encryptionAesKeyLength',
                'encryptionAesKeyHash',
            ],
        },
    },
};

const encryptedDocumentSchemaAsJsObject = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: [
        'schema',
        'nftType',
        'name',
        'description',
        'image',
        'collection',
        'encrypted',
        'author',
        'requiredSigners',
        'document',
    ],
    properties: {
        schema: { type: 'string', format: 'uri' },
        nftType: { type: 'string', pattern: 'encrypted_document.v[0-9]+' },
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'uri' },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: { name: { type: 'string' }, family: { type: 'string' } },
        },
        encrypted: { type: 'boolean' },
        author: { type: 'string' },
        requiredSigners: { type: 'string' },
        document: {
            type: 'object',
            properties: {
                originalFileName: { type: 'string' },
                originalFileFormat: { type: 'string' },
                originalFileSize: { type: 'integer' },
                originalFileHash: { type: 'string' },
                metaData: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        cateogry: { type: 'string' },
                        description: { type: 'string' },
                        creationDate: { type: 'string', format: 'date-time' },
                    },
                    required: ['title', 'cateogry', 'description', 'creationDate'],
                },
                data: {
                    type: 'object',
                    properties: {
                        data: { type: 'string' },
                        accessControls: { type: 'object', additionalProperties: { type: 'string' } },
                        ivBase64: { type: 'string' },
                        encoding: { type: 'string' },
                        documentDataEncryptionAlgorithm: { type: 'string' },
                        encryptionAesKeyLength: { type: 'integer' },
                        encryptionAesKeyHash: { type: 'string' },
                        aesKeysEncryptionAlgorithm: { type: 'string' },
                    },
                    required: [
                        'data',
                        'accessControls',
                        'ivBase64',
                        'encoding',
                        'documentDataEncryptionAlgorithm',
                        'encryptionAesKeyLength',
                        'encryptionAesKeyHash',
                        'aesKeysEncryptionAlgorithm',
                    ],
                },
            },
            required: [
                'originalFileName',
                'originalFileFormat',
                'originalFileSize',
                'originalFileHash',
                'metaData',
                'data',
            ],
        },
    },
};

const unencryptedDocumentSchemaAsJsObject = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: [
        'schema',
        'nftType',
        'name',
        'description',
        'image',
        'collection',
        'encrypted',
        'author',
        'requiredSigners',
        'document',
    ],
    properties: {
        schema: { type: 'string', format: 'uri' },
        nftType: { type: 'string', pattern: 'encrypted_document.v[0-9]+' },
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'uri' },
        collection: {
            type: 'object',
            required: ['name', 'family'],
            properties: { name: { type: 'string' }, family: { type: 'string' } },
        },
        encrypted: { type: 'boolean' },
        author: { type: 'string' },
        requiredSigners: { type: 'string' },
        document: {
            type: 'object',
            properties: {
                originalFileName: { type: 'string' },
                originalFileFormat: { type: 'string' },
                originalFileSize: { type: 'integer' },
                originalFileHash: { type: 'string' },
                metaData: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        cateogry: { type: 'string' },
                        description: { type: 'string' },
                        creationDate: { type: 'string', format: 'date-time' },
                    },
                    required: ['title', 'cateogry', 'description', 'creationDate'],
                },
                data: {
                    type: 'object',
                    properties: {
                        data: { type: 'string' },
                        encoding: { type: 'string' },
                        accessControls: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['data', 'encoding', 'accessControls'],
                },
            },
            required: [
                'originalFileName',
                'originalFileFormat',
                'originalFileSize',
                'originalFileHash',
                'metaData',
                'data',
            ],
        },
    },
};

const checkObject = {
    schema: 'ipfs://Qma6Tnpzycw36LhFarF8gEwFRWrLSxmosi27S6Mh8zSBxn',
    nftType: 'encrypted_document.v0',
    name: 'testtxt',
    description: 'testing doc upload',
    image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
    collection: { name: 'SigVerify Document Collection', family: 'encrypted_document' },
    encrypted: true,
    author: 'rUBCFsgC2cMueUh8sNFA9KsSbzYoUnbUk8',
    requiredSignersWallets: 'rDeZVeUM9TNgQbomYWnjsvCu1XDA8ZUBb2',
    document: {
        originalFileName: 'tester.txt',
        originalFileFormat: 'text/plain',
        originalFileSize: 229,
        originalFileHash: 'co5BE4k0EftoogvnPax0yFvGzQuK+B8ZODzx4+u6yhc2xn11TT7JzKxbAuWCPgVaXjYF+oXk9QnvCXXXKgZvfQ==',
        metadata: {
            title: 'testtxt',
            description: 'testing doc upload',
            category: 'custom',
            creationDate: '2024-01-25T22:05:46.305Z',
        },
        data: {
            data: 'LharBiau8fbsW3fFKb12L/ZoOmE9+BjovC/NmbYXDup5aCseHNKDj8xz6WZ4nOE8hULJ5YtLt4D1mgQfe7qAPe5iaAquSihRUYwL/PbgOq6QEIsBMhx1WABqBy/655sTsw9ffj3Awo46U4D+OMeBxEgN4J8DE3mXCHamQ7n58WQFPukrvZv+5iW1zMd246kO0mlE0hXrhpdxqbD0fDQfRzfX7HHz23IXW+iuYEJnsfyV6HLiyV+UD+g/8wws6GQ5bhwlZS+B7kZ8Rb/NoX2Mn9WT/D1/zDX4TWIDv1Sum361zOlm4Xw6LWq2VqhQsz3SscSDgBM=',
            encryptionAesKeyHash:
                '+MAw67Wj8EDGeM5fhrIl8ex5B87p/ZaczQOaL0LlvIGnbdzZbtO1aFX2pTqXMqVOLDNk/1+ThP63DDRQu5jNCQ==',
            accessControls: {
                f8aa8a95b86d15a9ff3084e476c6067a5a465090c6e5b91c9704c1995727c081:
                    'XBlGhet+ZDDB7vd2yWjjbaumQjAKzBbUgAhzTJrDapeJKs62G64zl5EHSHHXbPvjPqG19Z2qiCVJGilddHfdVYhM4L0eG5EByEHY9Uaoxq9sHaZ2zl8frPwfkdtQfBH+eR672ZKzVwcWaZ8nrx8eYlvnlyNJQny6YV6TD6tccDdE8TzMWwNHbw1sMopiXvSqPpCZ5XkubGoI8KnTx45wpkZbdPP8FyiiSRt9pzoXUl/qT6OCJdormrNq89htUu7VlMCTGmjlwiw2WzTFNBqyEP6vYRnXLHUXfUbSr5G4AgzjyHjKFQGVwlfPcLmI7h4QdIwJmRm3j5FVmZ3PIXPo9w==',
            },
            ivBase64: '8ssRMkeLv+hfKT3r',
            encoding: 'base64',
            documentDataEncryptionAlgorithm: 'AES-GCM',
            encryptionAesKeyLength: 256,
            aesKeysEncryptionAlgorithm: 'RSA-OAEP',
        },
    },
};