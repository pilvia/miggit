const vscode = require('vscode');
const rp = require('request-promise');
const child = require('child_process');

// Github Oauth2 token.
const authToken = '';

// Default project dir.
const projectDir = '';

function activate(context) {

    console.log('"github-cloner" is now active!');

    var disposable = vscode.commands.registerCommand('extension.cloneGit', async () => {
        
        try {
            var options = {
                url: 'https://api.github.com/user/repos',
                headers: {
                    'authorization' : 'Bearer ' + authToken,
                    'Content-Type' : 'application/json',
                    'User-Agent' : 'Request-Promise'
                },
                json: true
            };
            var repoList = await rp.get(options);
            let namelist = repoList.map(item => { return item.full_name } );    
            var selected = await vscode.window.showQuickPick(namelist, { placeHolder: 'Select repository to clone' });

            for (let i in repoList){
                if (repoList[i].full_name == selected) {
                    try{
                        vscode.window.showInformationMessage(`Cloning ${repoList[i].name} to ${projectDir}/${repoList[i].name}`);
                        var res = await runCommand(`git clone ${repoList[i].ssh_url} ${projectDir}/${repoList[i].name}`);
                        let uri = vscode.Uri.parse(`${projectDir}/${repoList[i].name}`);
                        let success = await vscode.commands.executeCommand('vscode.openFolder', uri, true);
                    }
                    catch(err){
                        console.log(err);
                        vscode.window.showErrorMessage(err.message);
                    }
                }
            }

        }
        catch (err) {
            console.error(err);
            vscode.window.showInformationMessage(selected);
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

// Execute SHELL commands
function runCommand(command) {
    return new Promise((resolve, reject) => {
        child.exec(command, (err, stderr, stdout) => {
            if(err){
                reject(err);
            } else {
                resolve(stdout); 
            }
        });
    });
}
  