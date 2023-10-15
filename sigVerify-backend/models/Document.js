const { model, models, Schema } = require('mongoose');

// MOCK DOCUMENT MONGODB ENTRY
// {
//   "_id": ObjectId("5f813274f6dd350e0073a11c"),
//   "filename": "document.pdf",
//   "contentType": "application/pdf",
//   "size": 123456, // Size in bytes
//   "uploadDate": ISODate("2023-10-14T12:34:56.789Z"),
//   "userId": ObjectId("5f80a9e6f6dd350e00739ef2"),
//   "tags": ["important", "financial"],
//   "description": "Quarterly financial report for Q3 2023.",
//   "fileExtension": "pdf",
//   "fileData": BinData(0, "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UaXRsZSAoU2lnVmVyaWZ5VGVzdFBkZikK..."),
// }

const DocumentSchema = new Schema({
    filename: String,
    filedata: Buffer,
    contentType: String,
    fromWallet: String
}, {
  timestamps: true,
});

const Document = models.Document || model('Document', DocumentSchema);

module.exports = Document;
