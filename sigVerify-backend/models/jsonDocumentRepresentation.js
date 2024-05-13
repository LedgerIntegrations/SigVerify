{
  "createdAt": "timestamp",
  "lastModified": "timestamp",
  "status": "active/inactive",
  "sections": [
    {
      "sectionId": "unique_section_identifier",
      "content": "Encrypted content or hash",
      "accessControl": {
        "read": ["user_id1", "user_id2"],
        "write": ["user_id3"],
        "execute": ["user_id4"]
      },
      "smartContractTrigger": {
        "triggerId": "contract_identifier",
        "conditions": [
          {
            "condition": "specific_condition_to_met",
            "action": "action_to_be_performed"
          }
        ]
      }
    }
  ],
  "verificationProcess": {
    "workflowId": "workflow_identifier",
    "steps": [
      {
        "stepId": "unique_step_identifier",
        "required": true,
        "verifiedBy": ["user_id5", "user_id6"]
      }
    ]
  }
}

{
  "documentId": "123456",
  "type": "Medical Consent Form",
  "title": "Consent for Medical Treatment",
  "description": "This consent form authorizes medical treatment for the patient named below.",
  "fileUrl": "https://example.com/path/to/medical_consent_form.pdf",
  "createdDate": "2024-05-08",
  "lastModifiedDate": "2024-05-08",
  "status": "pending",
  "signaturesRequired": [
    {
      "signerRole": "Patient",
      "signerDetails": {
        "name": "John Doe",
        "identifier": "patient-001",
        "contactEmail": "john.doe@example.com"
      },
      "signed": false,
      "signatureDate": null
    }3
  ],
  "metadata": {
    "patientId": "patient-001",
    "procedureCode": "PROC123",
    "hospital": "General Hospital",
    "department": "Surgery"
  },
  "legalClauses": [
    {
      "clauseTitle": "Consent to Treatment",
      "text": "I, the undersigned, consent to undergo the medical treatment as described in this document..."
    },
    {
      "clauseTitle": "Disclosure of Medical Information",
      "text": "I authorize the disclosure of my medical information to necessary medical personnel involved in my treatment..."
    }
  ],
  "actions": {
    "submit": "https://api.example.com/documents/123456/submit",
    "cancel": "https://api.example.com/documents/123456/cancel"
  }
}

{
  "documentId": "unique_document_identifier",
  "header": {
    "title": "Document Title",
    "owner": "owner_identifier",
    "createdAt": "timestamp",
    "lastModified": "timestamp",
    "status": "active/inactive"
  },
  "sections": [
    {
      "sectionId": "unique_section_identifier",
      "content": "Encrypted content or hash",
      "accessControl": {
        "read": ["user_id1", "user_id2"],
        "write": ["user_id3"],
        "execute": ["user_id4"]
      },
      "smartContractTrigger": {
        "triggerId": "contract_identifier",
        "conditions": [
          {
            "condition": "specific_condition_to_met",
            "action": "action_to_be_performed"
          }
        ]
      },
      "signatures": {
        "authorizingSigner": {
          "userId": "authorizing_user_id",
          "signedAt": "timestamp",
          "signature": "digital_signature_hash"
        },
        "recipientSigner": {
          "userId": "recipient_user_id",
          "signedAt": "timestamp",
          "signature": "digital_signature_hash"
        }
      }
    }
  ],
  "verificationProcess": {
    "workflowId": "workflow_identifier",
    "steps": [
      {
        "stepId": "unique_step_identifier",
        "required": true,
        "verifiedBy": ["user_id5", "user_id6"]
      }
    ]
  },
  "footer": {
    "finalSignatures": [
      {
        "userId": "final_signing_user_id1",
        "signature": "digital_signature_hash",
        "signedAt": "timestamp"
      },
      {
        "userId": "final_signing_user_id2",
        "signature": "digital_signature_hash",
        "signedAt": "timestamp"
      }
    ],
    "documentChecksum": "checksum_of_the_entire_document",
    "additionalDetails": "Any other necessary details or notes about the document."
  }
}
