const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testDatasetFlow() {
  try {
    console.log('--- Starting Dataset Flow Test ---');
    
    // 1. Auth Login (assumes seeded user from previous testing)
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user1@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('   Login successful, token acquired.');

    // Create a dummy CSV file to upload
    const dummyCsvPath = path.join(__dirname, 'test_data.csv');
    const csvContent = `id,age,income,category,target
1,25,50000,A,0
2,,60000,B,1
3,35,75000,A,1
4,45,,B,0
5,50,120000,C,1
6,22,45000,A,0
7,28,55000,,1
8,60,150000,C,0
9,31,68000,B,1
10,40,90000,A,1`;
    fs.writeFileSync(dummyCsvPath, csvContent);

    // 2. Upload Dataset
    console.log('\n2. Uploading dataset...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(dummyCsvPath));
    formData.append('name', 'API Test Dataset');
    formData.append('description', 'Dataset uploaded via test script');
    
    const uploadRes = await axios.post('http://localhost:5000/api/dataset/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    const datasetId = uploadRes.data.dataset._id;
    console.log(`   Upload successful. Dataset ID: ${datasetId}`);

    // Wait a brief moment to ensure DB read is consistent
    await new Promise(r => setTimeout(r, 1000));

    // 3. Fetch Dataset Details (to verify ML Engine analysis)
    console.log('\n3. Fetching dataset details & analysis...');
    const detailRes = await axios.get(`http://localhost:5000/api/dataset/${datasetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const fetchedDs = detailRes.data.dataset;
    console.log(`   Name: ${fetchedDs.name}`);
    console.log(`   Dimensions: ${fetchedDs.rowCount} rows x ${fetchedDs.columnCount} cols`);
    console.log(`   Metadata present: ${!!fetchedDs.metadata}`);
    if (fetchedDs.metadata) {
      console.log(`   - Correlation Matrix cols: ${Object.keys(fetchedDs.metadata.correlation || {}).join(', ')}`);
      console.log(`   - Null Counts: ${JSON.stringify(fetchedDs.metadata.nullCounts)}`);
    }

    // 4. Trigger Clean Pipeline
    console.log('\n4. Triggering Data Cleaning Pipeline...');
    const cleanRes = await axios.post(`http://localhost:5000/api/dataset/${datasetId}/clean`, {
      drop_missing: false,
      fill_missing: 'mean', // Test mean imputation
      drop_columns: ['id'], // Drop ID column
      encode_categorical: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const cleanedDsId = cleanRes.data.dataset._id;
    console.log(`   Cleaning successful. New Cleaned Dataset ID: ${cleanedDsId}`);

    // 5. Fetch Cleaned Dataset Details
    console.log('\n5. Fetching cleaned dataset details...');
    const cleanedDetailRes = await axios.get(`http://localhost:5000/api/dataset/${cleanedDsId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const finalDs = cleanedDetailRes.data.dataset;
    console.log(`   Name: ${finalDs.name}`);
    console.log(`   Is Cleaned Version: ${finalDs.isCleanedVersion}`);
    console.log(`   Rows: ${finalDs.rowCount} (Expected 10 since fill_missing was used)`);
    console.log(`   Cols: ${finalDs.columnCount} (Expected 4 since 'id' dropped)`);
    console.log(`   Null Counts: ${JSON.stringify(finalDs.metadata?.nullCounts)} (Expected all 0)`);

    console.log('\n--- Test Completed Successfully ---');
    fs.unlinkSync(dummyCsvPath); // Cleanup

  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testDatasetFlow();
