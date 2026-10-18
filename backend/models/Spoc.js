import mongoose from 'mongoose';

const spocSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  phoneNo: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
  },
  emailId: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@ksrce\.ac\.in$/, 'Email must be a valid @ksrce.ac.in address']
  },
  password: { type: String, required: true },
  role: { type: String, default: 'SPOC' }
}, { timestamps: true });

const Spoc = mongoose.model('Spoc', spocSchema);
export default Spoc;