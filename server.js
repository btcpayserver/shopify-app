const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

let deployInProgress = false;

app.post('/deploy', (req, res) => {
    if (deployInProgress) {
        return res.status(429).send('A deploy is already in progress. Try again shortly.\n');
    }
    deployInProgress = true;
    
    const child = spawn('bash', ['/app/deploy.sh'],
        {
            env: 
            {
                "SHOPIFY_CLI_PARTNERS_TOKEN":  req.body.cliToken,
                "CLIENT_ID": req.body.clientId,
                "PLUGIN_URL": req.body.pluginUrl,
                "APP_NAME": req.body.appName
            }
        });
    res.setHeader('Content-Type', 'text/plain');
    child.stdout.on('data', (data) => {
        res.write(data.toString()); // Stream stdout
    });

    child.stderr.on('data', (data) => {
        res.write(data.toString()); // Stream stderr
    });

    child.on('close', (code) => {
        deployInProgress = false;
        res.end(`\nProcess exited with code ${code}\n`);
    });

    child.on('error', (err) => {
        deployInProgress = false;
        res.status(500).end(`Failed to start deploy: ${err.message}\n`)
    })
});

app.listen(5000, () => console.log('Server running on port 5000'));
