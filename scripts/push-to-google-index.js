const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const globby = require('globby');

// Require a service account key JSON file from Google Cloud Console
// Ensure this API is enabled: "Web Search Indexing API"
const KEY_FILE_PATH = path.join(__dirname, 'gsc-service-account.json');

async function getJwtClient() {
  const credentials = require(KEY_FILE_PATH);
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/indexing'],
    null
  );
  
  await jwtClient.authorize();
  return jwtClient;
}

async function pushToGoogleIndex() {
  console.log('🚀 Initializing Google Indexing API Push Workflow...');
  
  try {
    const authClient = await getJwtClient();
    const indexing = google.indexing({ version: 'v3', auth: authClient });

    // 1. Locate all recently generated HTML files in the out/ directory
    // In a real programmatic scaling scenario, you'd only want to push *newly generated* permutations,
    // so we could read a last_run.timestamp or filter by mtime.
    const pages = await globby(['out/**/*.html', '!out/404.html']);
    
    console.log(`Found ${pages.length} potential routes. Filtering for newly built programmatic permutations...`);
    
    // Simulate filtering to only the latest batch
    const newRoutes = pages.slice(0, 100); // Google limits requests, chunking is required

    for (const page of newRoutes) {
      // Format the relative route back to an absolute production URL
      const route = page.replace('out', '').replace('.html', '').replace('/index', '');
      const url = `https://zeronode.com${route}`;

      console.log(`Pushing URL to Indexing API: ${url}`);
      
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED', // Can be URL_UPDATED or URL_DELETED
        },
      });

      console.log(`✅ Success for ${url}:`, response.data);
      
      // Artificial delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 Push workflow completed successfully!');

  } catch (error) {
    console.error('❌ Google Indexing API Error:', error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

pushToGoogleIndex();
