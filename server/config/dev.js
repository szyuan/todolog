'use strict';

// Development specific configuration
// ==================================
module.exports = {

    port: 9001,
    db: {
        mysql: {
            host: 'localhost',
            connectionLimit: 10,
            user: 'root',
            password: '',
            port: 3306,
            database: 'todolog'
        }
    }

};
