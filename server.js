const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
app.post('/deploy', (req, res) => {
    const process = spawn('bash', ['/app/deploy.sh'],
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
    process.stdout.on('data', (data) => {
        res.write(data.toString()); // Stream stdout
    });

    process.stderr.on('data', (data) => {
        res.write(data.toString()); // Stream stderr
    });

    process.on('close', (code) => {
        res.end(`\nProcess exited with code ${code}\n`);
    });
    });

app.listen(5000, () => console.log('Server running on port 5000'));
