// Import the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');
const {Storage} = require('@google-cloud/storage');

//client BigQuery
const bigqueryClient = new BigQuery();

//Client Firebase Storage
const storage = new Storage();

async function getDataFromAnalytics() {
  // la query pour filtrer les resultats analytics.
  const sqlQuery = `SELECT 
    * 
      FROM \`book-app-7f51e.analytics_269759773.events_20210626\` 
        WHERE event_name like '%view_item%'
  `;

  const options = {
    query: sqlQuery,
  };

  // Run the query
  const [rows] = await bigqueryClient.query(options);
  const datasetId = 'ml_alldata_app';
  const tableId = 'all_data';

  const data = {};
  const res_data = [];

  //getting all data from the view_item action of Analytics.
  rows.forEach(async row => {
    const event_params = row.event_params;
    // console.log('EVENT_PARAMS', event_params);
    event_params.forEach(params => {
      if (params.key === 'item_id') {
        data["book_id"] = params.value.string_value;
      }
      if (params.key === 'item_name') {
        data["book_title"] = params.value.string_value;
      }
      if (params.key === 'item_location_id') {
        data["user_id"] = params.value.string_value;
      }

      //changer l'event dans l'app pour match la category avec category et l'author avec author.
      if (params.key === 'item_category') {
        data["book_author"] = params.value.string_value;
      }
    })
  });

  res_data.push(data);
  console.log('Resultat data', res_data);

  //insert data inside the table where all the infos are gathered.
  await bigqueryClient
    .dataset(datasetId)
    .table(tableId)
    .insert(res_data);
}
getDataFromAnalytics();

async function extractTableToGCS() {
  // Exports my_dataset:my_table to gcs://my-bucket/my-file as raw CSV.

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  const datasetId = 'ml_alldata_app';
  const tableId = 'all_data';
  const bucketName = "gs://book-app-7f51e.appspot.com/ml_data";
  const filename = "test_export_csv";

  const options = {
    location: 'EU',
  };

  // Export data from the table into a Google Cloud Storage file
  const [job] = await bigqueryClient
    .dataset(datasetId)
    .table(tableId)
    .extract(storage.bucket(bucketName).file(filename), options);

  console.log(`Job ${job.id} created.`);

  // Check the job's status for errors
  const errors = job.status.errors;
  if (errors && errors.length > 0) {
    throw errors;
  }
}

extractTableToGCS();