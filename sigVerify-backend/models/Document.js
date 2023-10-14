const { model, models, Schema } = require('mongoose');

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
