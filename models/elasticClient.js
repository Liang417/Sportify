import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
});

async function createIndex(indexName) {
  try {
    const response = await client.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              smartcn_analyzer: {
                type: 'custom',
                tokenizer: 'smartcn_tokenizer',
              },
            },
            tokenizer: {
              smartcn_tokenizer: {
                type: 'smartcn_tokenizer',
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'integer', index: false },
            title: { type: 'text', index: true, analyzer: 'smartcn_analyzer' },
            current_attendees_count: { type: 'integer', index: false },
            start_from: { type: 'date', index: false },
            picture: { type: 'text', index: false },
            location_name: { type: 'text', index: true, analyzer: 'smartcn_analyzer' },
            tags: { type: 'keyword', index: true },
          },
        },
      },
    });

    console.log('Index created', response);
  } catch (error) {
    console.error('An error occurred while creating the index:', error);
  }
}

async function reindexData(oldIndexName, newIndexName) {
  try {
    const response = await client.reindex({
      body: {
        source: {
          index: oldIndexName,
        },
        dest: {
          index: newIndexName,
        },
      },
    });

    console.log('Data reindexed', response);
  } catch (error) {
    console.error('An error occurred while reindexing the data:', error);
  }
}

await createIndex('activities');
// await reindexData('activities2', 'activities');
// await client.indices.delete({ index: 'activities2' });

export default client;
