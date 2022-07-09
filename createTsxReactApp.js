const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const spawn = require('cross-spawn');
const validateProjectName = require('validate-npm-package-name');

const packageJson = require('./package.json');

// TOOD: port to module design 


let projectName;

function init() {
    // Set up command line interface
    const program = new commander.Command()
        .version(packageJson.version)
        .arguments('<project-directory>')
        // TODO: add additional [options]
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(argName => {
            projectName = argName;
        })
        .option('--verbose', 'print additional logs')
        .option('--skip-conflict-check', 'skip possible conflict checks (not recommended)')
        .addOption(new commander.Option('--npm-debug-level <d|dd|ddd>', 'set npm verbose level').choices(['d', 'dd', 'ddd']))
        .parse(process.argv);
    if (typeof projectName === 'undefined') {
        console.log(chalk.red('Please specify the project directory:'));
        console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
        console.log();
        console.log(`  ${chalk.cyan('Try')} ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
        process.exit(1);
    }


    // TODO: do node version checking 

    // TODO: do some version checks to see if there is a more recent version of this package
    // if everything passes then create app
    const opts = program.opts()
    createApp(
        projectName,
        opts.verbose,
        opts.skipConflictCheck,
        opts.npmDebugLevel
    );

}

function createApp(name, verbose, skipConflictCheck, npmDebugLevel) {
    // TODO: do node version checking
    const appPath = path.resolve(name);
    const appName = path.basename(appPath);



    ensureAppName(appName);
    log("Passed name checks...", LOGGING.INFO, true);
    ensureDirExists(appName, skipConflictCheck)
    log(`Directory ${appPath} created...`, LOGGING.INFO, true);

    const packageJson = {
        "name": appName,
        "version": "0.0.1",
        "private": true,
        "scripts": {
            "start": "webpack-dev-server --mode development --config webpack.config.js",
            "build": "webpack --mode production --config webpack.config.js",
        }
    };
    fs.writeFileSync(
        path.join(appPath, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );
    log(`package.json created...`, LOGGING.INFO, true);

    install(
        appPath,
        npmDebugLevel,
        verbose
    )

    const baseTsconfigJson = {
        "compilerOptions": {
            "target": "es2016",
            "module": "commonjs",
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "strict": true,
            "skipLibCheck": true,
            "jsx": "react",
        }
    }

    fs.writeFileSync(
        path.join(appPath, 'tsconfig.json'),
        JSON.stringify(baseTsconfigJson, null, 2) + os.EOL
    );
    log(`tsconfig.json created...`, LOGGING.INFO, true);
}

function install(
    appPath,
    npmDebugLevel,
    verbose
) {
    const OldPwd = process.cwd();
    process.chdir(appPath);

    // Install deps.
    const deps = ['react', 'react-dom'];
    const devDeps = ['@babel/core', 'babel-loader', '@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript', 'webpack', 'webpack-cli', 'webpack-dev-server', 'html-webpack-plugin', '@types/react', '@types/react-dom', '@types/webpack-env'];
    console.log(`${chalk.green("Installing dependencies...")} ${chalk.cyan(deps.join(' '))}`);
    const args = ['install', '--save-exact'];
    const devArgs = ['install', '--save', '--save-exact', '--save-dev'];
    execCommand('npm', args.concat(deps), 'inherit').then(
        () => {
            console.log(`${chalk.green("Installing dependencies...")} ${chalk.cyan(devDeps.join(' '))}`);
            execCommand('npm', devArgs.concat(devDeps), 'inherit');
        }
    )
}


// UTIL CONST

LOGGING = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NOTSET: 4
}

// UTIL FUNCTIONS

function log(message, level, verbose) {
    if (verbose) {
        switch (true) {
            case (level === LOGGING.DEBUG):
                console.log(chalk.blueBright(message));
                break;
            case (level === LOGGING.INFO):
                console.log(chalk.green(message));
                break;
            case (level === LOGGING.WARN):
                console.log(chalk.yellow(message));
                break;
            case (level === LOGGING.ERROR):
                console.log(chalk.red(message));
                break;
            case (level === LOGGING.NOTSET):
                console.log(message);
                break;
        }
    }
}

function dlog(message) {
    log(message, LOGGING.DEBUG, true);
}


function ensureAppName(name) {
    // Check if valid npm package name
    const validationResult = validateProjectName(name);
    if (!validationResult.validForNewPackages) {
        console.error(
            chalk.red(
                `Cannot create a project named ${chalk.green(
                    `"${name}"`
                )} because of npm naming restrictions:\n`
            )
        );
        [
            ...(validationResult.errors || []),
            ...(validationResult.warnings || []),
        ].forEach(error => {
            console.error(chalk.red(`  * ${error}`));
        });
        console.error(chalk.red('\nPlease choose a different project name.'));
        process.exit(1);
    }
    // Check if name clashes with dependencies
    const dependencies = ['react', 'react-dom'];
    if (dependencies.includes(name)) {
        console.error(
            chalk.red(
                `Could not create a project called ${chalk.green(`"${name}"`)} because a dependency with the same name exists.`
            )
        );

        console.error(chalk.red('\nPlease choose a different project name.'));
        process.exit(1);
    }
}

function ensureDirExists(dir, skipConflictCheck) {
    const validObjs = [
        '.dockerignore',
        '.DS_Store',
        '.git',
        '.gitattributes',
        '.gitignore',
        '.gitlab-ci.yml',
        '.hg',
        '.hgcheck',
        '.hgignore',
        '.idea',
        '.npmignore',
        '.travis.yml',
        '.vscode',
        'docs',
        'LICENSE',
        'README.md',
        'mkdocs.yml',
        'Thumbs.db',
    ];
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        return;
    }
    if (skipConflictCheck) {
        return;
    }
    const conflicts = fs
        .readdirSync(dir)
        .filter(file => !validObjs.includes(file));
    if (conflicts.length > 0) {
        console.error(
            chalk.red(
                `The directory ${chalk.green(dir)} contains files that could conflict with the project being created`
            ));
        console.log(
            chalk.red(
                `If you are sure you want to continue anyways, use the ${chalk.cyan("--skip-conflict-check")} option.`
            ));
        process.exit(1);
    }
}

function execCommand(command, args, stdioOpt) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: stdioOpt });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

module.exports = {
    init
}