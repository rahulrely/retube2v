// Copyright 2016 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const youtube = google.youtube('v3');

const runSample = async (fileName) => {
  try {
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, '../oauth2.keys.json'),
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
      ],
    });
    google.options({ auth });

    const fileSize = fs.statSync(fileName).size;
    
    const res = await youtube.videos.insert(
      {
        part: 'id,snippet,status',
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: 'Node.js YouTube Upload Test',
            description: 'Testing YouTube upload via Google APIs Node.js Client',
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: fs.createReadStream(fileName),
        },
      },
      {
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0, null);
          process.stdout.write(`${Math.round(progress)}% complete`);
        },
      }
    );
    
    console.log('\n\n', res.data);
    return res.data;
  } catch (error) {
    console.error('Error uploading video:', error);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const fileName = process.argv[2];
  runSample(fileName).catch(console.error);
}

export default runSample;