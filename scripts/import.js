#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models (assuming backend is built)
const User = require('../backend/dist/models/User').default;
const Counsellor = require('../backend/dist/models/Counsellor').default;
const Resource = require('../backend/dist/models/Resource').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';

class ImportTool {
  constructor() {
    this.report = {
      students: { accepted: 0, errors: [] },
      counsellors: { accepted: 0, errors: [] },
      resources: { accepted: 0, errors: [] },
    };
  }

  async connect() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  async importStudents(filePath) {
    console.log('Importing students...');
    
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          for (const row of results) {
            try {
              // Validate required fields
              if (!row.name || !row.email || !row.rollNumber || !row.collegeId) {
                this.report.students.errors.push({
                  row: row,
                  error: 'Missing required fields: name, email, rollNumber, collegeId'
                });
                continue;
              }

              // Validate consent
              if (row.consent !== 'true' && row.consent !== true) {
                this.report.students.errors.push({
                  row: row,
                  error: 'Consent must be true'
                });
                continue;
              }

              // Check if user already exists
              const existingUser = await User.findOne({ email: row.email });
              if (existingUser) {
                this.report.students.errors.push({
                  row: row,
                  error: 'User already exists with this email'
                });
                continue;
              }

              // Create user
              const user = new User({
                name: row.name.trim(),
                email: row.email.toLowerCase().trim(),
                rollNumber: row.rollNumber.trim(),
                collegeId: row.collegeId.trim(),
                consent: true,
              });

              await user.save();
              this.report.students.accepted++;
              
            } catch (error) {
              this.report.students.errors.push({
                row: row,
                error: error.message
              });
            }
          }
          resolve();
        })
        .on('error', reject);
    });
  }

  async importCounsellors(filePath) {
    console.log('Importing counsellors...');
    
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          for (const row of results) {
            try {
              // Validate required fields
              if (!row.name || !row.email || !row.registrationId) {
                this.report.counsellors.errors.push({
                  row: row,
                  error: 'Missing required fields: name, email, registrationId'
                });
                continue;
              }

              // Check if counsellor already exists
              const existingCounsellor = await Counsellor.findOne({ email: row.email });
              if (existingCounsellor) {
                this.report.counsellors.errors.push({
                  row: row,
                  error: 'Counsellor already exists with this email'
                });
                continue;
              }

              // Parse languages
              const languages = row.languages ? row.languages.split(',').map(lang => lang.trim()) : ['English'];

              // Create counsellor
              const counsellor = new Counsellor({
                name: row.name.trim(),
                email: row.email.toLowerCase().trim(),
                verified: true,
                languages: languages,
                availabilitySlots: [], // Default empty, can be set later
              });

              await counsellor.save();
              this.report.counsellors.accepted++;
              
            } catch (error) {
              this.report.counsellors.errors.push({
                row: row,
                error: error.message
              });
            }
          }
          resolve();
        })
        .on('error', reject);
    });
  }

  async importResources(filePath) {
    console.log('Importing resources...');
    
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          for (const row of results) {
            try {
              // Validate required fields
              if (!row.title || !row.type || !row.language || !row.fileRef) {
                this.report.resources.errors.push({
                  row: row,
                  error: 'Missing required fields: title, type, language, fileRef'
                });
                continue;
              }

              // Validate type
              if (!['video', 'audio', 'pdf'].includes(row.type)) {
                this.report.resources.errors.push({
                  row: row,
                  error: 'Type must be video, audio, or pdf'
                });
                continue;
              }

              // Parse tags
              const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()) : [];

              // Create resource
              const resource = new Resource({
                title: row.title.trim(),
                type: row.type,
                language: row.language.trim(),
                fileRef: row.fileRef.trim(),
                tags: tags,
                offlineAvailable: row.offlineAvailable === 'true' || row.offlineAvailable === true,
                description: row.description ? row.description.trim() : undefined,
              });

              await resource.save();
              this.report.resources.accepted++;
              
            } catch (error) {
              this.report.resources.errors.push({
                row: row,
                error: error.message
              });
            }
          }
          resolve();
        })
        .on('error', reject);
    });
  }

  printReport() {
    console.log('\n=== IMPORT REPORT ===');
    
    console.log('\nStudents:');
    console.log(`  Accepted: ${this.report.students.accepted}`);
    console.log(`  Errors: ${this.report.students.errors.length}`);
    if (this.report.students.errors.length > 0) {
      console.log('  Error details:');
      this.report.students.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.error}`);
        if (error.row.email) console.log(`       Email: ${error.row.email}`);
      });
    }

    console.log('\nCounsellors:');
    console.log(`  Accepted: ${this.report.counsellors.accepted}`);
    console.log(`  Errors: ${this.report.counsellors.errors.length}`);
    if (this.report.counsellors.errors.length > 0) {
      console.log('  Error details:');
      this.report.counsellors.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.error}`);
        if (error.row.email) console.log(`       Email: ${error.row.email}`);
      });
    }

    console.log('\nResources:');
    console.log(`  Accepted: ${this.report.resources.accepted}`);
    console.log(`  Errors: ${this.report.resources.errors.length}`);
    if (this.report.resources.errors.length > 0) {
      console.log('  Error details:');
      this.report.resources.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.error}`);
        if (error.row.title) console.log(`       Title: ${error.row.title}`);
      });
    }

    console.log('\n=== END REPORT ===');
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node import.js <type> <filepath>');
    console.log('Types: students, counsellors, resources');
    console.log('Example: node import.js students ./data/students.csv');
    process.exit(1);
  }

  const [type, filePath] = args;

  if (!['students', 'counsellors', 'resources'].includes(type)) {
    console.error('Invalid type. Must be: students, counsellors, or resources');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const importTool = new ImportTool();
  
  try {
    await importTool.connect();

    // Ask for confirmation
    console.log(`\nAbout to import ${type} from ${filePath}`);
    console.log('This will add data to the database. Continue? (y/N)');
    
    // For automated scripts, you can set AUTO_CONFIRM=true
    if (process.env.AUTO_CONFIRM !== 'true') {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('Import cancelled');
        process.exit(0);
      }
    }

    // Import based on type
    switch (type) {
      case 'students':
        await importTool.importStudents(filePath);
        break;
      case 'counsellors':
        await importTool.importCounsellors(filePath);
        break;
      case 'resources':
        await importTool.importResources(filePath);
        break;
    }

    importTool.printReport();
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await importTool.disconnect();
  }
}

// CSV Headers Documentation
function printCSVHeaders() {
  console.log('\n=== CSV HEADERS ===');
  console.log('\nStudents CSV headers:');
  console.log('name,email,rollNumber,collegeId,consent');
  console.log('Example: John Doe,john@college.edu,CS2023001,COLLEGE001,true');
  
  console.log('\nCounsellors CSV headers:');
  console.log('name,email,registrationId,languages');
  console.log('Example: Dr. Smith,smith@clinic.com,REG123,English,Hindi');
  
  console.log('\nResources CSV headers:');
  console.log('title,type,language,fileRef,tags,offlineAvailable,description');
  console.log('Example: "Stress Management Video",video,English,/videos/stress.mp4,"stress,management",true,"A helpful video about managing stress"');
  console.log('\n=== END HEADERS ===');
}

if (args.includes('--help') || args.includes('-h')) {
  printCSVHeaders();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImportTool;
