const axios = require('axios');
const path = require('path');

async function debugAnalyze() {
    const ML_ENGINE_URL = 'http://localhost:8000';
    const testFile = path.resolve('d:/project modelforge/server/uploads/1773671922035.csv');
    
    console.log(`Testing analysis for: ${testFile}`);
    
    try {
        const res = await axios.post(`${ML_ENGINE_URL}/analyze`, {
            dataset_path: testFile
        });
        
        console.log('SUCCESS: ML Engine returned status:', res.status);
        // console.log('Data sample:', JSON.stringify(res.data, null, 2).substring(0, 500));
        
        const stats = res.data;
        const columns = Object.keys(stats.dtypes).map(colName => ({
            name: colName,
            type: stats.dtypes[colName].includes('int') || stats.dtypes[colName].includes('float') ? 'number' : 'string',
            missingCount: stats.missing_values[colName] || 0,
            uniqueCount: stats.categorical_stats[colName]?.unique_count || 0
        }));
        
        console.log(`Parsed ${columns.length} columns successfully.`);
        console.log('Column names:', columns.map(c => c.name));
        
    } catch (err) {
        console.error('FAILED:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

debugAnalyze();
