/*
* Create and export configuration variables
*/

// container for all the enviroments
const enviroments = {};

// stagin (default) enviroment
enviroments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};

// production environement
enviroments.production = {
    'httpPort': 80,
    'httpsPort': 443,
    'envName': 'production'
};

// determine which environment was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

// check if the current environment is one of the environment above, if not default to staging
const enviromentToExport = typeof(enviroments[currentEnvironment]) == 'object' ? enviroments[currentEnvironment] : enviroments.staging;

// export the module
module.exports = enviromentToExport;